using Aws_TestApiNet6.Models;
using Aws_TestApiNet6.Utilities;
using Repository.Access;
using System.Text;

namespace Aws_TestApiNet6.Middlewares
{
    internal class TokenMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly Seguridad _seguridad;
        private readonly Base _baseController;
        private readonly IConfiguration _configuration;

        public TokenMiddleware(RequestDelegate next, IConfiguration configuration, Seguridad seguridad, Base baseController)
        {
            _seguridad = seguridad;
            _next = next;
            _baseController = baseController;
            _configuration = configuration;
        }

        public async Task Invoke(HttpContext httpContext)
        {

            bool AuthorizationIsValid = true;

            string url = httpContext.Request.Headers["Origin"].ToString();
            var headers = httpContext.Request.Headers.ToList();

            TokenModel tokenModel = new TokenModel
            {

                RefreshToken = headers.Where(x => x.Key == "RefreshToken")?.Select(x => x.Value).FirstOrDefault(),
                Token = headers.Where(x => x.Key == "Authorization").Select(x => x.Value).FirstOrDefault(),
                DireccionIp = _seguridad.ObtenerIpCliente()
            };

            //Nueva validacion de origenes 
            List<string> objects = new List<string>();
            foreach (var obj in _configuration.GetSection("Origins").GetChildren().ToList())
            {
                objects.Add(obj.Value);
            }
            //Fin de validacion de Origenes


            if (!string.IsNullOrEmpty(tokenModel.Token))
            {
                Boolean validaToken = true;
                //apis no necesitan autorizacion
                if (Convert.ToBoolean(_configuration.GetSection("ValidateUrls").GetSection("active").Value) == true)
                {

                    foreach (var _url in _configuration.GetSection("ValidateUrls").GetSection("urls").GetChildren().ToList())
                    {
                        if (httpContext.Request.Path.Value.Contains(_url.Value.ToString().Trim()))
                        {
                            validaToken = false;
                            break;
                        }
                    }
                }
                if (validaToken)
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
                        AuthorizationIsValid = true; 
                    else 
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
