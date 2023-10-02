using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Repository.Access;
using sln_Steel.Utilities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;


namespace sln_Steel.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class LoginController : BaseController
    {
        private readonly Base _baseApi;
        private readonly Seguridad _seguridad;
        private readonly IConfiguration _config;

        public LoginController(Base baseApi, IConfiguration config, Seguridad seguridad, BaseController baseController) : base(config, TypeConnection.Seguridad)
        {
            _baseApi = baseApi;
            _seguridad = seguridad;
            _config = config;
        }

        // POST: api/Login
        [HttpPost("[action]")]
        [AllowAnonymous]
        public async Task<IActionResult> SignIn([FromBody]Dictionary<string, string> usuarioLogin)
        {
            TokenModel token;
            List<MenuNavegacion> menu;
            try
            {
                menu = new List<MenuNavegacion>();
                Dictionary<string, string> _userInfoDic = new Dictionary<string, string>();

                usuarioLogin["IdAplicacion"] = IdAplicacion;

                usuarioLogin["Method"] = "uspLogin_skrs";
                usuarioLogin["Schema"] = "Seguridad";
                var _userInfo = await ConsultaSimpleAsync(usuarioLogin);

                if (_userInfo.Count == 0)
                    return StatusCode(404, new { Error = "Usuario no encontrado" });
                else
                    foreach (var k in _userInfo[0])
                        _userInfoDic.Add(k.Key, k.Value.ToString()); 

                if (_userInfo.Count > 0)
                {


                    //Se manda llamar las opciones de menu de base de datos 
                    usuarioLogin["Method"] = "uspObtenerOpcionesUsuario_skrs";
                    usuarioLogin["Schema"] = "Seguridad";
                    usuarioLogin["IdUsuario"] = _userInfoDic["IdUsuario"];


                    List<Dictionary<string, object>> opciones = await ConsultaSimpleAsync(usuarioLogin);

                    List<MenuNavegacion> menuUsuario = new List<MenuNavegacion>();
                    if (opciones.Count > 0)
                        menuUsuario = armarMenu(opciones);

                    //menu = await _seguridad.MenuUsuario(Convert.ToInt16(usuarioLogin["IdUsuario"]), IdAplicacion);

                    token = await _seguridad.GenerarToken(_userInfoDic, verificarToken: true, desbloquearSesion: Convert.ToBoolean(_userInfoDic.ContainsKey("DesbloquearSesion") ? Convert.ToBoolean(_userInfoDic["DesbloquearSesion"]) : false));


                    return StatusCode(200, new
                    {
                        token.Token,
                        token.RefreshToken,
                        MenuUsuario = menuUsuario,
                        Opciones = opciones,
                        InfoUser = _userInfo
                    });
                }
                else
                {
                    return StatusCode(404, new { Error = "No tienes autorización para esta aplicación." });
                }
            }
            catch (Exception e)
            {
                return StatusCode(500, new { Error = e.Message });
            }

        }

        private List<MenuNavegacion> armarMenu(List<Dictionary<string, object>> opcionesUsuario)
        {

            List<MenuNavegacion> menuUsuario = new List<MenuNavegacion>();


            for (int i = 0; i < opcionesUsuario.Count; i++)
            {
                Dictionary<string, object> opcion = opcionesUsuario[i];


                if ((Int32)opcion["IDMenuSuperior"] == 0)
                {

                    if (opcion["type"].ToString().ToLower() == "collapsable")
                    {
                        MenuNavegacion collapsiblemenu = new MenuNavegacion
                        {
                            id = Convert.ToString($"{opcion["Opcion"]}-{i}"),
                            type = "collapsable",
                            title = Convert.ToString(opcion["Opcion"]),
                            //link = opcion["link"].ToString(),
                            icon = opcion["Control"].ToString(),
                            children = new List<MenuNavegacionItem>()
                        };

                        // si es collapsible entonces puede tener hijos 
                        int IdOpcion = Convert.ToInt32(opcion["IdOpcion"]);

                        for (int k = 0; k < opcionesUsuario.Count; k++)
                        {
                            Dictionary<string, object> children = opcionesUsuario[k];

                            if ((int)children["IDMenuSuperior"] == IdOpcion && children["type"].ToString().ToLower() == "basic")
                            {
                                collapsiblemenu.children.Add(new MenuNavegacion
                                {
                                    id = Convert.ToString($"{children["Opcion"]}-{k}"),
                                    type = "basic",
                                    title = Convert.ToString(children["Opcion"]),
                                    link = children["link"].ToString(),
                                    icon = children["Control"].ToString()
                                });
                            }
                        }

                        menuUsuario.Add(collapsiblemenu);
                    }
                    else
                    {
                        // si no es colapsible es directo parte del menu
                        menuUsuario.Add(new MenuNavegacion
                        {
                            id = Convert.ToString($"{opcion["Opcion"]}-{i}"),
                            type = "basic",
                            title = Convert.ToString(opcion["Opcion"]),
                            link = opcion["link"].ToString(),
                            icon = opcion["Control"].ToString()
                        });

                    }



                }



            }

            return menuUsuario;


        }

        [HttpGet("[action]")]
        public IActionResult ObtenerMenu(Dictionary<string, string> data)
        {
            var menu = _seguridad.MenuUsuario(Convert.ToInt32(data["IdUsuario"]), IdAplicacion);
            return StatusCode(200, new ResponsePayload(menu));
        }

        [HttpGet("[action]")]
        public async Task<IActionResult> ExisteOpcionAsync(Dictionary<string, string> data)
        {
            var acciones = await _seguridad.ObtenerOpciones(data);
            acciones = acciones.ToList();
            return StatusCode(200, new ResponsePayload(acciones.Any(x => x["IdOpcion"].ToString() == data["IdOpcion"].ToString())));
        }



        [HttpPost("[action]")]
        [AllowAnonymous]
        public async Task<IActionResult> GetMenu([FromBody]Dictionary<string, string> usuarioLogin)
        {
            if (usuarioLogin != null)
            {
                List<Dictionary<string, object>> opcionesUsuario = await obtenerOpcionesUsuario(usuarioLogin);
                List<MenuNavegacion> menuUsuario = armarMenu(opcionesUsuario);

                return StatusCode(200, new
                {
                    menuUsuario,
                    opciones = opcionesUsuario,
                });
            }
            else
                return StatusCode(400, new
                {
                    Error = "El token es inválido"
                });
        }
        private Task<List<Dictionary<string, object>>> obtenerOpcionesUsuario(Dictionary<string, string> usuarioLogin)
        {
            return _seguridad.ObtenerOpciones(usuarioLogin);
        }

        [HttpGet("[action]")]
        public async Task<IActionResult> ExisteIdOpcion(Dictionary<string, string> data)
        {

            try
            {
                data["Method"] = "usp_IdOpcion_sk";
                data["Schema"] = "seguridad";
                var acciones = (await ConsultaSimpleAsync(data)).ToList();
                return StatusCode(200, new ResponsePayload(
                        acciones.Any(accion => data["IdOpcion"].Split(',').Any(y => y.ToString() == accion["IdOpcion"].ToString()))
                    ));
            }
            catch (Exception e)
            {
                return StatusCode(500, new { Error = e.Message });
            }


        }
        [HttpPost("[action]")]
        public async Task<IActionResult> PermisosPorModulo([FromBody] Dictionary<string, string> data)
        {
            try
            {
                data["Method"] = "usp_permisosPOrModulo_skrs";
                data["Schema"] = "seguridad";
                var response = new Dictionary<string, object>();
                response["Data"] = await ConsultaSimpleAsync(data);
                return StatusCode(200, response);
            }
            catch (Exception e)
            {
                return StatusCode(500, new { Error = e.Message });
            }


        }

        // POST: api/Logout
        [HttpPost("[action]")]
        [AllowAnonymous]
        public async Task<IActionResult> Logout([FromBody]Dictionary<string, string> usuarioLogout)
        {
            string Token;
            try
            {

                Token = usuarioLogout["Token"];
                if (!string.IsNullOrEmpty(Token))
                {
                    TokenValidator _TokenValidator = new TokenValidator(Token);
                    usuarioLogout["Method"] = "uspLogout_del";
                    usuarioLogout["Schema"] = "Seguridad";
                    usuarioLogout["Jti"] = _TokenValidator.Jti;
                    usuarioLogout["IdUsuario"] = _TokenValidator.IdUsuario.ToString();
                    usuarioLogout["IdEmpresa"] = _TokenValidator.IdEmpresa.ToString();
                    usuarioLogout["DireccionIp"] = _seguridad.ObtenerIpCliente();

                    await ConsultaSimpleAsync(usuarioLogout);
                    return StatusCode(200);
                }
                return StatusCode(400, new
                {
                    Error = "El token es inválido"
                });
            }
            catch (Exception e)
            {
                return StatusCode(500, new { Error = e.Message });
            }
        }

        // GET: api/RefreshPermisos 
        [HttpGet("[action]")]
        [AllowAnonymous]
        public async Task<IActionResult> RefreshPermisosAsync(Dictionary<string, string> usuarioRefreshPermisos)
        {
            try
            {
                List<Dictionary<string, object>> opcionesUsuario = await _seguridad.ObtenerOpciones(usuarioRefreshPermisos);
                return StatusCode(200, opcionesUsuario);
            }
            catch (Exception e)
            {
                return StatusCode(500, new { Error = e.Message });
            }
        }

        // GET: api/RefreshToken
        [HttpPost("[action]")]
        [AllowAnonymous]
        public async Task<IActionResult> RefreshToken([FromBody]Dictionary<string, string> data)
        {
            string RefreshToken;
            try
            {
                RefreshToken = Request.Headers["RefreshToken"];
                TokenModel token = await _seguridad.ModificarToken(RefreshToken, data);
                if (token == null)
                {
                    return StatusCode(401);
                }
                else
                {
                    return StatusCode(200, new
                    {
                        Token = token.Token,
                        RefreshToken = token.RefreshToken
                    });
                }
            }
            catch (Exception e)
            {
                return StatusCode(500, new { Error = e.Message });
            }
        }

        [HttpPost("CatEmpresas")]
        [AllowAnonymous]
        public IActionResult CatEmpresas(Dictionary<string, string> datos)
        {
            Dictionary<string, object> response;

            try
            {
                datos["Method"] = "catEmpresas";
                datos["Schema"] = "dbo";
                response = new Dictionary<string, object>();
                response["Data"] = ConsultaSimple(datos);

                return StatusCode(200, response);
            }
            catch (Exception e)
            {
                return StatusCode(500, new { Error = e.Message });
            }
            finally
            {
                response = null;
            }

        }
        [HttpGet("CatEmpresas")]
        [AllowAnonymous]
        public IActionResult CatEmpresasGet(Dictionary<string, string> datos)
        {
            Dictionary<string, object> response;

            try
            {
                datos["Method"] = "catEmpresas";
                datos["Schema"] = "dbo";
                response = new Dictionary<string, object>();
                response["Data"] = ConsultaSimple(datos);

                return StatusCode(200, response);
            }
            catch (Exception e)
            {
                return StatusCode(500, new { Error = e.Message });
            }
            finally
            {
                response = null;
            }

        }

        [HttpPost("ActualizarMenu")]
        public IActionResult ActualizarMenu(Dictionary<string, string> datos)
        {
            List<Dictionary<string, object>> menuItemsPadre, opcionesUsuario;
            try
            {
                if (!datos.ContainsKey("MedicoExterno"))
                    throw new Exception("No se puede actualizar el menu");

                opcionesUsuario = _seguridad.ObtenerOpcionesNoAsync(datos);

                menuItemsPadre = ArmarMenu(opcionesUsuario);



                return StatusCode(200, menuItemsPadre);
            }
            catch (Exception e)
            {
                return StatusCode(500, new { Error = e.Message });
            }
            finally
            {
                menuItemsPadre = null;
            }

        }

        [HttpPost("[action]")]
        [AllowAnonymous]
        public async Task<IActionResult> RecoveryPassword([FromBody]Dictionary<string, string> datos)
        {
            try
            {
                if (!datos.ContainsKey("Email"))
                    return StatusCode(500, new { Error = "El Usuario o email es requerido." });

                if (!datos.ContainsKey("IdEmpresa"))
                    return StatusCode(500, new { Error = "La Empresa  es requerido." });

                // Creacion de un token de Recuperacion de contraseña
                TokenModel tokenModel = await _seguridad.CreateTokenRecoveryPassword(datos);
                TokenValidator tokenValidator = new TokenValidator(tokenModel.Token);

                datos["Token"] = tokenModel.Token;
                datos["Origin"] = HttpContext.Request.Headers["Origin"].ToString();
                datos["Api"] = "reset-password";
                datos["UrlRecuperacion"] = datos["Origin"] + "/" + datos["Api"] + "/" + tokenModel.Token;
                datos["FechaExpiracion"] = tokenValidator.FechaExpiracion.ToString();
                datos["Ip"] = _seguridad.ObtenerIpCliente();

                if (tokenModel.Token != null)
                    datos["UrlRecuperacion"] = HttpContext.Request.Headers["Origin"].ToString() + "/reset-password/" + tokenModel.Token;
                else
                    return StatusCode(500, new { Error = "No se genero el Token." });


                datos["Method"] = "uspGuardarTokenRecoveryYEnvioMail";
                datos["Schema"] = "Seguridad";
                await ConsultaSimpleAsync(datos);
                return StatusCode(200, new { mensaje = "Se ha enviado un link a tu correo para la recuperación de tu contraseña." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("ValidarToken")]
        [AllowAnonymous]
        public IActionResult ValidarToken(Dictionary<string, string> datos)
        {

            Dictionary<string, object> response;
            TokenValidator _TokenValidator;

            try
            {
                response = new Dictionary<string, object>();
                if (!datos.ContainsKey("Token"))
                    throw new Exception("Token no encontrado");
                //e crea un token 
                _TokenValidator = new TokenValidator(datos["Token"]);

                datos["Audience"] = _TokenValidator.Audience.ToString();
                datos["Jti"] = _TokenValidator.Jti.ToString();
                datos["FechaExpiracion"] = _TokenValidator.FechaExpiracion.ToString();
                datos["Email"] = _TokenValidator.Email.ToString();

                if (_TokenValidator.FechaExpiracion.CompareTo(DateTime.Now) <= 0)
                    return StatusCode(406, new { Error = "El token ya no es valido o vencio." });
                //validar fecha 

                datos["Method"] = "usp_ObtenerInformacionTokenValida";
                datos["Schema"] = "Seguridad";
                response = new Dictionary<string, object>();
                response["Data"] = ConsultaSimple(datos);

                return StatusCode(200, response);
            }
            catch (Exception e)
            {
                return StatusCode(500, new { Error = e.Message });
            }
            finally
            {
                response = null;
            }



        }

        [HttpPost("CambiarPassword")]
        [AllowAnonymous]
        public IActionResult CambiarPassword(Dictionary<string, string> datos)
        {

            Dictionary<string, object> response;
            TokenValidator _TokenValidator;

            try
            {
                response = new Dictionary<string, object>();
                if (!datos.ContainsKey("Token"))
                    throw new Exception("Token no encontrado");

                //e crea un token 
                _TokenValidator = new TokenValidator(datos["Token"]);

                datos["Audience"] = _TokenValidator.Audience.ToString();

                if (_TokenValidator.FechaExpiracion.CompareTo(DateTime.Now) <= 0)
                    return StatusCode(406, new { Error = "El token ya no es valido o vencio." });
                //validar fecha 

                datos["Method"] = "usp_cambiarPassword_upd";
                datos["Schema"] = "Seguridad";
                response = new Dictionary<string, object>();
                response["Data"] = ConsultaSimple(datos);

                return StatusCode(200, response);
            }
            catch (Exception e)
            {
                return StatusCode(500, new { Error = e.Message });
            }
            finally
            {
                response = null;
            }

        }

        [HttpPost("ValidateTokenRecovery")]
        [AllowAnonymous]
        public async Task<IActionResult> ValidateTokenRecovery([FromBody]Dictionary<string, string> datos)
        {

            Dictionary<string, object> response;
            TokenValidator _TokenValidator;

            try
            {
                response = new Dictionary<string, object>();
                if (!datos.ContainsKey("Token"))
                    throw new Exception("Token no encontrado");
                //e crea un token 
                _TokenValidator = new TokenValidator(datos["Token"]);



                datos["Audience"] = _TokenValidator.Audience.ToString();
                datos["Jti"] = _TokenValidator.Jti.ToString();
                datos["FechaExpiracion"] = _TokenValidator.FechaExpiracion.ToString();
                datos["Email"] = _TokenValidator.Email.ToString();


                if (_TokenValidator.FechaExpiracion.CompareTo(DateTime.Now) <= 0)
                    return StatusCode(200, new { Error = "El token ya no es valido o vencio." });
                //validar fecha 

                datos["Method"] = "usp_ObtenerInformacionTokenRecoveryValida";
                datos["Schema"] = "Seguridad";
                response = new Dictionary<string, object>();
                response["Data"] = await ConsultaSimpleAsync(datos);

                return StatusCode(200, response);
            }
            catch (Exception e)
            {
                return StatusCode(200, new { Error = e.Message });
            }
            finally
            {
                response = null;
            }
        }

        [HttpPost("ResetPassword")]
        [AllowAnonymous]
        public async Task<IActionResult> ResetPassword([FromBody]Dictionary<string, string> datos)
        {

            Dictionary<string, object> response;
            TokenValidator _TokenValidator;

            try
            {
                response = new Dictionary<string, object>();
                if (!datos.ContainsKey("Token"))
                    throw new Exception("Token no encontrado");
                //e crea un token 
                _TokenValidator = new TokenValidator(datos["Token"]);



                datos["Audience"] = _TokenValidator.Audience.ToString();
                datos["Jti"] = _TokenValidator.Jti.ToString();
                datos["FechaExpiracion"] = _TokenValidator.FechaExpiracion.ToString();
                datos["Email"] = _TokenValidator.Email.ToString();


                if (_TokenValidator.FechaExpiracion.CompareTo(DateTime.Now) <= 0)
                    return StatusCode(200, new { Error = "El token ya no es valido o vencio." });
                //validar fecha 

                datos["Method"] = "usp_ResetPassword";
                datos["Schema"] = "Seguridad";
                response = new Dictionary<string, object>();
                response["Data"] = await ConsultaSimpleAsync(datos);

                return StatusCode(200, new { mensaje = "Se ha cambiado tu contraseña correctamente." });
            }
            catch (Exception e)
            {
                return StatusCode(200, new { Error = e.Message });
            }
            finally
            {
                response = null;
            }
        }

        [HttpPost("ActualizarProfile")]
        public IActionResult ActualizarProfile(Dictionary<string, string> datos)
        {
            Dictionary<string, object> response;

            try
            {

                datos["Method"] = "usp_actualizarProfile_upd";
                datos["Schema"] = "Seguridad";
                response = new Dictionary<string, object>();
                response["Data"] = ConsultaSimple(datos);

                return StatusCode(200, response);
            }
            catch (Exception e)
            {
                return StatusCode(500, new { Error = e.Message });
            }
            finally
            {
                response = null;
            }
        }

        [HttpPost("[action]")]

        public async Task<IActionResult> PermisosRoute([FromBody] Dictionary<string, string> data)
        {
            try
            {
                data["Method"] = "uspObtenerPermisosRuta_skrs";
                data["Schema"] = "Seguridad";

                List<Dictionary<string, object>> responseData = await ConsultaSimpleAsync(data);
                return StatusCode(200, responseData);
            }
            catch (Exception e)
            {
                return StatusCode(500, new { Error = e.Message });
            }
        }

        // POST: api/Login
        [HttpPost("[action]")]
        public async Task<IActionResult> ConfirmedDelete([FromBody]Dictionary<string, string> data)
        {

            try
            {
                data["Method"] = "uspConfirmedDelete";
                data["Schema"] = "Seguridad";

                List<Dictionary<string, object>> responseData = await ConsultaSimpleAsync(data);
                return StatusCode(200, responseData);
            }
            catch (Exception e)
            {
                return StatusCode(500, new { Error = e.Message });
            }

        }

        private List<Dictionary<string, object>> ArmarMenu(List<Dictionary<string, object>> opcionesUsuario)
        {
            List<Dictionary<string, object>> menuItemsPadre;
            try
            {
                menuItemsPadre = opcionesUsuario.Where(dictionary => dictionary.ContainsKey("IdMenuSuperior") && (int)dictionary["IdMenuSuperior"] == 0).ToList();

                //Armado del Menu
                foreach (Dictionary<string, object> menuPadre in menuItemsPadre)
                {
                    List<Dictionary<string, object>> Submenu = opcionesUsuario.Where(dic => dic.ContainsKey("IdMenuSuperior") && (int)dic["IdMenuSuperior"] == (int)menuPadre["IdOpcion"]).ToList();

                    if (Submenu.Count > 0)
                        menuPadre.Add("Submenu", Submenu);
                }

                return menuItemsPadre;
            }
            catch (Exception)
            {

                throw;
            }

        }
    }
}