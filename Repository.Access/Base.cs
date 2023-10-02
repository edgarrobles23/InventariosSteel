using Microsoft.IdentityModel.Tokens;
using Repository.Data.Repositories.Default;
using System;
using System.Collections.Generic;
using System.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;


namespace Repository.Access
{
    public partial class Base
    {
        private string conexionString;

        private string linkedServer;

        public enum ConnectionType
        {
            Default,
            Hospital,
            Steel,
            Seguridad
        }

        private ConnectionType connectionType = ConnectionType.Default;

        public Base(ConnectionType tc, string connectionString, string LinkedServer = null)
        {
            connectionType = tc;
            conexionString = connectionString;

            linkedServer = LinkedServer;
        }

        public Dictionary<string, object> ConsultaMultiple(Dictionary<string, string> datos)
        {
            DefaultRepository repository;
            DataSet ds;
            Dictionary<string, object> response;
            try
            {
                repository = new DefaultRepository(conexionString);
                response = new Dictionary<string, object>();
                repository.Timeout = 800;

                if (this.linkedServer != null)
                    datos["LinkedServer"] = this.linkedServer;

                ds = repository.ConsultaMultiple(datos);

                if (ds.Tables.Count > 0)
                {
                    for (int i = 0; i < ds.Tables.Count; i++)
                        response.Add(i.ToString(), DataTableToMap(ds.Tables[i]));
                }
                return response;

            }
            catch (Exception)
            {

                throw;
            }
            finally
            {
                ds = null;
                response = null;
                repository = null;
            }
        }
        public List<Dictionary<string, object>> ConsultaSimple(Dictionary<string, string> datos)
        {
            DefaultRepository repository;
            List<Dictionary<string, object>> response;
            try
            {
                repository = new DefaultRepository(conexionString);
                response = new List<Dictionary<string, object>>();
                repository.Timeout = 800;

                if (this.linkedServer != null)
                    datos["LinkedServer"] = this.linkedServer;

                response = repository.ConsultaSimple(datos);

                return response;
            }
            catch (Exception)
            {

                throw;
            }
            finally
            {
                repository = null;
                response = null;
            }
        }
        public List<Dictionary<string, object>> DataTableToMap(DataTable p_dt)
        {
            List<Dictionary<string, object>> maps = new List<Dictionary<string, object>>();
            Dictionary<string, object> row;

            foreach (DataRow dr in p_dt.Rows)
            {
                row = new Dictionary<string, object>();

                foreach (DataColumn col in p_dt.Columns)
                {
                    row.Add(col.ColumnName, dr[col]);
                }

                maps.Add(row);
            }

            return maps;
        }


        // COMPROBAMOS SI EL USUARIO EXISTE EN LA BASE DE DATOS 
        public Dictionary<string, string> AutenticarUsuario(Dictionary<string, string> usuarioLogin)
        {
            // AQUÍ LA LÓGICA DE AUTENTICACIÓN // 
            DataTable objDataTable = null;
            DefaultRepository repository;
            try
            {
                repository = new DefaultRepository(conexionString);


                string schema = usuarioLogin.ContainsKey("Schema") ? usuarioLogin["Schema"] : "Seguridad";
                string method = "uspLogin_skrs";

                if (this.linkedServer != null)
                    usuarioLogin["LinkedServer"] = this.linkedServer;



                objDataTable = repository.ExecuteQuery(schema + "." + method, usuarioLogin).Tables[0];

                Dictionary<string, string> row = new Dictionary<string, string>();

                foreach (DataRow dr in objDataTable.Rows)
                {
                    foreach (DataColumn col in objDataTable.Columns)
                    {
                        row.Add(col.ColumnName, dr[col].ToString());
                    }
                }
                return row;
            }
            catch (Exception)
            {
                throw;
            }

            //// Supondremos que el Usuario existe en la Base de Datos.
            //// Retornamos un objeto del tipo UsuarioInfo, con toda
            //// la información del usuario necesaria para el Token.
            //Dictionary<string, string> regreso = new Dictionary<string, string>()
            //{
            //    // Id del Usuario en el Sistema de Información (BD)
            //    {"Id" , (new Guid("B5D233F0-6EC2-4950-8CD7-F44D16EC878F")).ToString() },
            //    {"Nombre" , "Nombre Usuario" },
            //    {"Apellidos" , "Apellidos Usuario" },
            //    {"Email" , "email.usuario@dominio.com" },

            //};
            //regreso.Add("Rol", "Administrador");

            //return regreso;

            //// Supondremos que el Usuario NO existe en la Base de Datos.
            //// Retornamos NULL.
            ////return null;
        }

        // GENERAMOS EL TOKEN CON LA INFORMACIÓN DEL USUARIO
        public string GenerarTokenJWT(Dictionary<string, string> usuarioInfo, string jwtSecretKey, string jwtIssuer, string jwtAudience, int jwtExpirationMinutes)
        {
            try
            {
                // CREAMOS EL HEADER //
                var _symmetricSecurityKey = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(jwtSecretKey)
                    );
                var _signingCredentials = new SigningCredentials(
                        _symmetricSecurityKey, SecurityAlgorithms.HmacSha256
                    );
                var _Header = new JwtHeader(_signingCredentials);

                // CREAMOS LOS CLAIMS //
                var _Claims = new[] {
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(JwtRegisteredClaimNames.NameId, usuarioInfo["IdUsuario"].ToString()),
                new Claim("Nombre", usuarioInfo["Nombre"].ToString()),
                new Claim("ApellidoPaterno", usuarioInfo["ApellidoPaterno"].ToString()),
                new Claim(JwtRegisteredClaimNames.Email, usuarioInfo["Email"].ToString()),
                //new Claim(ClaimTypes.Role, "User"),
                new Claim(ClaimTypes.Role, (usuarioInfo.ContainsKey("Role") && usuarioInfo["Role"].ToString()!="")?usuarioInfo["Role"].ToString(): "User"), 
                //new Claim(ClaimTypes.Role, "SuperAdmin")
            };

                // CREAMOS EL PAYLOAD //
                var _Payload = new JwtPayload(
                        issuer: jwtIssuer,
                        audience: jwtAudience,
                        claims: _Claims,
                        notBefore: DateTime.UtcNow,
                        // Exipra a la 24 horas.
                        expires: DateTime.UtcNow.AddMinutes(jwtExpirationMinutes)

                    );

                // GENERAMOS EL TOKEN //

                var _Token = new JwtSecurityToken(
                        _Header,
                        _Payload
                    );

                return new JwtSecurityTokenHandler().WriteToken(_Token);
            }
            catch (Exception)
            {

                throw;
            }
        }

        internal object ConsultaSimple(string v)
        {
            throw new NotImplementedException();
        }
    }
}
