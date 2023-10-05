using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Repository.Access;

namespace Aws_TestApiNet6.Controllers
{
    [ApiController]
    [Route("[controller]")]
    [AllowAnonymous]
    public class WeatherForecastController : ControllerBase
    {
         
        private readonly  Base _baseController;
        private readonly IConfiguration _configuration; 

        public WeatherForecastController(Base baseController, IConfiguration configuration)
        {
            _baseController = baseController;
            _configuration = configuration;
        }

       

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            //Repository.SqlServer.Database db;
            try
            {
                Dictionary<string, string> Data = new Dictionary<string, string>(); 
                Data["Schema"] = "dbo";
                Data["Method"] = "uspObtenerEmpresas_skrs";

                var response = await _baseController.ConsultaSimpleAsync(Data);
                return StatusCode(200, response);

            }
            catch (Exception e)
            {
                return StatusCode(500, new { Error = e.Message });
            }
        }
    }
}