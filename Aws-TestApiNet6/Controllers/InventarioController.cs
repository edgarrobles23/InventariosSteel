using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Repository.Access;

namespace Aws_TestApiNet6.Controllers
{
    [ApiController]
    [Route("api/[controller]")] 
    public class InventarioController : ControllerBase
    {

        private readonly Base _baseController;
        private readonly IConfiguration _configuration;

        public InventarioController(Base baseController, IConfiguration configuration)
        {
            _baseController = baseController;
            _configuration = configuration;
        }
        [HttpGet]
        public async Task<IActionResult> Get()
        { 
            try
            {
                Dictionary<string, string> Data = new Dictionary<string, string>();
                Data["Respuesta"] = "InventarioController";  
                return StatusCode(200, Data);

            }
            catch (Exception e)
            {
                return StatusCode(500, new { Error = e.Message });
            }
        }


        [HttpPost("[action]")]
        public IActionResult GetInventario([FromBody] Dictionary<string, string> Data)
        {
            Base? bc;
            try
            {
                var VarConfig = _configuration.GetSection("config").GetSection(_configuration["siteMode"]);
                string? conexionString = VarConfig.GetSection("SteelConnection").Value;
                bc = new Base(Base.ConnectionType.Steel, conexionString);

                Data["Schema"] = "dbo";
                Data["Method"] = "UspInventario_Skrs";

                var response = bc.ConsultaSimple(Data);
                return StatusCode(200, response);
            }
            catch (Exception e)
            {
                return StatusCode(500, new { Error = e.Message });
            }
            finally
            {
                bc = null;
            }
        }

    }
}