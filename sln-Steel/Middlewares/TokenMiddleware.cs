using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using sln_Steel.Controllers;
using sln_Steel.Utilities;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace sln_Steel.Middlewares
{
    public class TokenMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly Seguridad _seguridad;
        private readonly BaseController _baseController;

        public TokenMiddleware(RequestDelegate next, Seguridad seguridad, BaseController baseController)
        {
            _seguridad = seguridad;
            _next = next;
            _baseController = baseController;
        }

        public async Task Invoke(HttpContext httpContext)
        {

            bool AuthorizationIsValid = true;

            string url = httpContext.Request.Headers["Origin"].ToString();

            TokenModel tokenModel = new TokenModel
            {
                RefreshToken = httpContext.Request.Headers.ToList().Where(x => x.Key == "RefreshToken")?.Select(x => x.Value).FirstOrDefault(),
                Token = httpContext.Request.Headers.ToList().Where(x => x.Key == "Authorization").Select(x => x.Value).FirstOrDefault(),
                DireccionIp = _seguridad.ObtenerIpCliente()
            };

            //Nueva validacion de origenes 
            List<string> objects = new List<string>();
            foreach (var obj in _baseController.Config.GetSection("Origins").GetChildren().ToList())
            {
                objects.Add(obj.Value);
            }


            //Fin de validacion de Origenes


            if (!string.IsNullOrEmpty(tokenModel.Token)
                    && !httpContext.Request.Path.Value.Contains("/api/Login/SignIn")
                    && !httpContext.Request.Path.Value.Contains("/api/Login/Logout")
                      && !httpContext.Request.Path.Value.Contains("/api/Login/RefreshToken")
                    && !httpContext.Request.Path.Value.Contains("/api/Catalogos/ListHospitales")
                    && !httpContext.Request.Path.Value.Contains("/api/Login/GetMenu")
                    && !httpContext.Request.Path.Value.Contains("/api/Pago/WebHook")
                    && !httpContext.Request.Path.Value.Contains("/api/Pago/WebHookManually")
                    && !httpContext.Request.Path.Value.ToLower().Contains("/api/ProgramacionEstudio/updateEstudio".ToLower())
                    && !httpContext.Request.Path.Value.ToLower().Contains("/api/hubs".ToLower())
                    )
            {
                tokenModel.Token = tokenModel.Token.ToString().Split(' ')[1];
                TokenValidator tokenValidator = new TokenValidator(tokenModel.Token);
                TokenModel tokenActivo = await _seguridad.VerificarTokenActivo(tokenValidator.IdUsuario.ToString(), tokenValidator.IdEmpresa.ToString());
                if (tokenActivo == null)
                {
                    httpContext.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    return;
                }
                bool tokenExpirado = DateTime.Now > tokenValidator.FechaExpiracion;
                if (string.Equals(tokenModel.DireccionIp, tokenActivo.DireccionIp) && !tokenExpirado)
                {
                    //await _next(httpContext);
                    AuthorizationIsValid = true;
                }
                else
                {
                    //httpContext.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    //return;
                    AuthorizationIsValid = false;

                }
            }

            if (AuthorizationIsValid) await _next(httpContext);
            else
            {
                try
                {
                    //Open the File
                    StreamWriter sw = new StreamWriter("log.txt", true, Encoding.ASCII);

                    //Write out the numbers 1 to 10 on the same line.
                    sw.Write(url);
                    sw.Write(httpContext.Request.Path.Value);
                    sw.Write(url);


                    //close the file
                    sw.Close();
                }
                catch (Exception)
                {
                }
                httpContext.Response.StatusCode = StatusCodes.Status401Unauthorized;
                return;
            }


        }
    }

    public static class TokenMiddlewareExtensions
    {
        public static IApplicationBuilder UseVerificationToken(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<TokenMiddleware>();
        }
    }
}
