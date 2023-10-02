using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace sln_Steel.Utilities
{
    public class Seguridad
    {
        private readonly Repository.Access.Base _baseController;
        private readonly IConfiguration _configuration;
        private IConfigurationSection _jwtSection;
        private SymmetricSecurityKey _claveSecreta;
        private string _audience;
        private string _issuer;
        private string _expiracion;
        private string _expiracionTokenRecovery;

        private readonly IHttpContextAccessor _httpContextAccessor;

        public Seguridad(Repository.Access.Base baseController, IConfiguration configuration, IHttpContextAccessor httpContextAccessor)
        {
            IConfigurationSection jwtSection = configuration.GetSection("JWT");
            _baseController =  baseController;
            _configuration = configuration;
            _jwtSection = jwtSection;
            _claveSecreta = new SymmetricSecurityKey(Encoding.Default.GetBytes(jwtSection["ClaveSecreta"]));
            _audience = jwtSection["Audience"];
            _issuer = jwtSection["Issuer"];
            _expiracion = jwtSection["ExpirationMinutes"];
            _expiracionTokenRecovery = jwtSection["ExpirationMinutesRecoveryPassword"];

            _httpContextAccessor = httpContextAccessor;
        }

        public TokenValidationParameters TokenValidationParameters
        {
            get
            {
                return new TokenValidationParameters
                {
                    ValidateActor = true,
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidIssuer = _jwtSection["Issuer"],
                    ValidAudience = _jwtSection["Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.Default.GetBytes(_jwtSection["ClaveSecreta"]))
                };
            }
        }

        public async Task<List<Dictionary<string, object>>> ObtenerOpciones(Dictionary<string, string> data)
        {
            data["Method"] = "uspObtenerOpcionesUsuario_skrs";
            data["Schema"] = "Seguridad";


            List<Dictionary<string, object>> opciones = await _baseController.ConsultaSimpleAsync(data);
            List<Dictionary<string, object>> opcionesUsuario = new List<Dictionary<string, object>>();
            opciones.ForEach(opcion =>
            {
                opcionesUsuario.Add(opcion);
            }
             );

            return opcionesUsuario;
        }
        public List<Dictionary<string, object>> ObtenerOpcionesNoAsync(Dictionary<string, string> datos)
        {
            List<Dictionary<string, object>> opciones, opcionesUsuario;
            try
            {
                opciones = new List<Dictionary<string, object>>();
                datos["Method"] = "uspObtenerOpcionesUsuario_skrs";
                datos["Schema"] = "Seguridad";

                opciones = _baseController.ConsultaSimple(datos);
                opcionesUsuario = new List<Dictionary<string, object>>();

                opciones.ForEach(opcion =>
                {
                    opcionesUsuario.Add(opcion);
                }
                );
                return opcionesUsuario;
            }
            catch (Exception e)
            {

                throw e;
            }

        }
        public async Task<TokenModel> GenerarToken(Dictionary<string, string> data, bool verificarToken = true, bool desbloquearSesion = false)
        {
            SigningCredentials credentials = new SigningCredentials(_claveSecreta, SecurityAlgorithms.HmacSha256);
            List<Claim> claims = new List<Claim>();
            claims.Add(new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()));
            claims.Add(new Claim("Email", Convert.ToString(data["Email"])));
             
            claims.Add(new Claim("IdEmpresa", Convert.ToString(data["IdEmpresa"])));
            claims.Add(new Claim("Empresa", Convert.ToString(data["Empresa"])));
            claims.Add(new Claim("InicialesEmpresa", Convert.ToString(data["InicialesEmpresa"])));

            claims.Add(new Claim("IdUsuario", Convert.ToString(data["IdUsuario"])));
            claims.Add(new Claim("Usuario", data["Usuario"]));
            claims.Add(new Claim("Nombre", Convert.ToString(data["Nombre"])));
            claims.Add(new Claim("ApellidoPaterno", data["ApellidoPaterno"]));
            claims.Add(new Claim("Role", data.ContainsKey("Role") ? data["Role"] : "Usuario"));


            if (desbloquearSesion)
            {
                Dictionary<string, string> sesion = new Dictionary<string, string>
                {
                    {"Method", "uspEliminarTokensIP_del" },
                    {"Schema", "Seguridad" },
                    {"DireccionIP", ObtenerIpCliente() },
                    {"IdUsuario", data["IdUsuario"].ToString() },
                };
                await _baseController.ConsultaSimpleAsync(sesion);
            }

            JwtSecurityToken jwtSecurityToken = new JwtSecurityToken
                (
                    audience: _audience,
                    issuer: _issuer,
                    claims: claims,
                    notBefore: DateTime.Now,
                    expires: DateTime.Now.AddMinutes(Convert.ToInt32(_expiracion)),
                    signingCredentials: credentials
                );
            TokenModel token;
            if (verificarToken)
            {
                token = await VerificarTokenActivo(data["IdUsuario"].ToString(), data["IdEmpresa"].ToString());

                if (token == null)
                {
                    token = await CrearNuevoToKenAsync(jwtSecurityToken);
                }
                else
                {
                    //Validacion de Claims si se hga modificado
                    List<Claim> InfoToken = new TokenValidator(token.Token).Claims;
                    var EmpresaClaim = InfoToken.Find(it => it.Type == "Empresa").Value;
                    var InicialesEmpresaClaim = InfoToken.Find(it => it.Type == "InicialesEmpresa").Value;

                    if (data["Empresa"].ToString() != EmpresaClaim || data["InicialesEmpresa"].ToString() != InicialesEmpresaClaim)
                    {
                        token = await CrearNuevoToKenAsync(jwtSecurityToken);
                    }

                }
            }
            else
            {
                token = await CrearNuevoToKenAsync(jwtSecurityToken);

            }
            return token;
        }

        public async Task<TokenModel> CreateTokenRecoveryPassword(Dictionary<string, string> data)
        {
            SigningCredentials credentials = new SigningCredentials(_claveSecreta, SecurityAlgorithms.HmacSha256);
            List<Claim> claims = new List<Claim>();
            claims.Add(new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()));
            claims.Add(new Claim("Email", Convert.ToString(data["Email"])));
            claims.Add(new Claim("IdEmpresa", Convert.ToString(data["IdEmpresa"])));
            if (_expiracionTokenRecovery == null)
                _expiracionTokenRecovery = "60";

            JwtSecurityToken jwtSecurityToken = new JwtSecurityToken
                (
                    audience: _audience,
                    issuer: _issuer,
                    claims: claims,
                    notBefore: DateTime.Now,
                    expires: DateTime.Now.AddMinutes(Convert.ToInt32(_expiracionTokenRecovery)),
                    signingCredentials: credentials
                );

            var token = await CrearNuevoToKenAsync(jwtSecurityToken);
            return token;
        }


        private async Task<TokenModel> CrearNuevoToKenAsync(JwtSecurityToken jwtSecurityToken)
        {
            var token = new TokenModel();
            JwtSecurityTokenHandler tokenHandler = new JwtSecurityTokenHandler();
            token.Token = tokenHandler.WriteToken(jwtSecurityToken);
            token.RefreshToken = CrearRefreshToken();
            await InsertarToken(token.Token, token.RefreshToken);
            return token;
        }

        public async Task<TokenModel> VerificarTokenActivo(string idUsuario, string idEmpresa)
        {
            string direccionIp = ObtenerIpCliente();
            #region Eliminar tokens expirados
            Dictionary<string, string> spEliminarTokenData = new Dictionary<string, string>
            {
                {"Method", "uspEliminarTokensExpirados" },
                {"Schema", "Seguridad" }
            };
            await _baseController.ConsultaSimpleAsync(spEliminarTokenData);
            #endregion

            #region Obtener token activo del usuario
            Dictionary<string, string> tokenActivoUsuarioData = new Dictionary<string, string>
            {
                {"Method", "uspObtenerTokenActivoUsuario_skrs" },
                {"Schema", "Seguridad" },
                {"IdUsuario", idUsuario },
                {"DireccionIp", direccionIp },
                {"IdEmpresa", idEmpresa }
            };
            List<Dictionary<string, object>> tokenActivo = await _baseController.ConsultaSimpleAsync(tokenActivoUsuarioData);
            if (tokenActivo.Count > 0)
            {
                return new TokenModel
                {
                    Token = tokenActivo[0]["Token"]?.ToString(),
                    RefreshToken = tokenActivo[0]["RefreshToken"]?.ToString(),
                    DireccionIp = tokenActivo[0]["DireccionIp"]?.ToString()
                };
            }
            else return null;

            #endregion
        }

        public async Task<TokenModel> ModificarToken(string refreshToken, Dictionary<string, string> data)
        {
            TokenModel tokenActivo = await VerificarTokenActivo(data["IdUsuario"].ToString(), data["IdEmpresa"].ToString());
            if (tokenActivo != null)
            {
                if (string.Equals(tokenActivo.RefreshToken, refreshToken))
                {

                    var user = await ObtenerUsuario(data);

                    TokenModel token = await GenerarToken(user, false);
                    Dictionary<string, string> response = new Dictionary<string, string>
                    {
                        {"Method", "uspModificarToken_upd" },
                        {"Schema", "Seguridad" },
                        {"RefreshToken", token.RefreshToken },
                        {"DireccionIP", ObtenerIpCliente() },
                        {"IdUsuario", data["IdUsuario"] },
                        {"IdEmpresa", data["IdEmpresa"] },
                        {"Token", token.Token }
                    };

                    await _baseController.ConsultaSimpleAsync(response);
                    return token;
                }
                else return tokenActivo;
            }
            else return null;
        }

        public async Task InsertarToken(string token, string _refreshToken)
        {
            TokenValidator tokenValidator;
            try
            {
                if (!string.IsNullOrEmpty(token))
                {
                    Dictionary<string, string> data = new Dictionary<string, string>();
                    data["Method"] = "uspInsertarToken_ins";
                    data["Schema"] = "Seguridad";

                    tokenValidator = new TokenValidator(token);

                    data["Audience"] = tokenValidator.Audience;
                    data["Expira"] = Convert.ToString(tokenValidator.FechaExpiracion);
                    data["Issuer"] = tokenValidator.Issuer;
                    data["Jti"] = tokenValidator.Jti;
                    data["Token"] = token;
                    data["RefreshToken"] = _refreshToken;
                    data["DireccionIp"] = ObtenerIpCliente();
                    data["IdEmpresa"] = Convert.ToString(tokenValidator.IdEmpresa);
                    data["IdUsuario"] = Convert.ToString(tokenValidator.IdUsuario);

                    await _baseController.ConsultaSimpleAsync(data);
                }
                else
                {
                    throw new NullReferenceException("El Key Token no existe o es nulo en el diccionario");
                }
            }
            catch (Exception e)
            {

                throw e;
            }
        }


        public string CrearRefreshToken()
        {
            byte[] randomBytes = new byte[32];
            using (RandomNumberGenerator rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(randomBytes);
                return Convert.ToBase64String(randomBytes);
            }
        }

        public string ObtenerIpCliente()
        {
            //return _httpContextAccessor.HttpContext.Connection.RemoteIpAddress.ToString();
            return "192.168.0.189";

        }

        private Dictionary<string, object> ObtenerPermisos(Dictionary<string, object> opcion)
        {
            return new Dictionary<string, object>
            {
                {"Insertar", opcion["Insertar"] },
                {"Borrar", opcion["Borrar"] },
                {"Modificar", opcion["Modificar"] },
                {"Imprimir", opcion["Imprimir"] }
            };
        }

        public async Task<List<MenuNavegacion>> MenuUsuario(int idUsuario, string IdAplicacion)
        {
            Dictionary<string, string> data = new Dictionary<string, string>
            {
                {"IdAplicacion", IdAplicacion  },
                {"IdUsuario", idUsuario.ToString() }
            };
            var opciones = await ObtenerOpciones(data);
            List<MenuNavegacion> menu = new List<MenuNavegacion>();
            for (int i = 0; i < opciones.Count; i++)
            {
                Dictionary<string, object> opcion = opciones[i];
                if (Convert.ToInt32(opcion["Tipo"]) == 1)
                {
                    menu.Add(new MenuNavegacion
                    {
                        id = Convert.ToString($"{opcion["Opcion"]}-{i}"),
                        type = "group",
                        title = Convert.ToString(opcion["Opcion"]),
                        idOpcion = Convert.ToInt32(opcion["IdOpcion"]),
                        idMenuSuperior = Convert.ToInt32(opcion["IDMenuSuperior"]),
                        idTipo = Convert.ToInt32(opcion["Tipo"])
                    });
                }

                if (Convert.ToInt32(opcion["Tipo"]) == 2)
                {
                    int idMenuSuperior = Convert.ToInt32(opcion["IDMenuSuperior"]);
                    MenuNavegacion menuSuperior = menu.Find(m => m.idOpcion == idMenuSuperior);
                    if (menuSuperior.Children == null)
                    {
                        menuSuperior.Children = new List<MenuNavegacionItem>();
                    }
                    menuSuperior.Children.Add(new MenuNavegacionItem
                    {
                        id = Convert.ToString($"{opcion["Opcion"]}-{i}").Replace(" ", string.Empty),
                        type = "basic",
                        title = Convert.ToString(opcion["Opcion"]),
                        idOpcion = Convert.ToInt32(opcion["IdOpcion"]),
                        idTipo = Convert.ToInt32(opcion["Tipo"]),
                        idMenuSuperior = Convert.ToInt32(opcion["IDMenuSuperior"]),
                        icon = Convert.ToString(opcion["Icono"]),
                        link = Convert.ToString(opcion["Control"])
                    });
                }
            }
            return menu;
        }
        public async Task<Dictionary<string, string>> ObtenerUsuario(Dictionary<string, string> data_)
        {
            Dictionary<string, string> data = new Dictionary<string, string>
            {
                {"Method", "uspObtenerDatosUsuario_skrs" },
                {"Schema", "Seguridad" },
                {"IdUsuario", data_["IdUsuario"]}

            };
            var usuario = await _baseController.ConsultaSimpleAsync(data);

            Dictionary<string, string> response = new Dictionary<string, string>();

            foreach (KeyValuePair<string, object> keyValuePair in usuario[0])
            {
                if (!data_.ContainsKey(keyValuePair.Key))
                    data_.Add(keyValuePair.Key, keyValuePair.Value.ToString());
            }

            if (usuario.Count > 0) return data_;
            else return null;
        }


    }
}
