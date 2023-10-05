using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
//using Repository.Interface;

namespace ApiSteel_NET6.Controllers
{
    [ApiController]
    [Route("[controller]")]
    [AllowAnonymous]
    public class WeatherForecastController : ControllerBase
    {

        //private readonly ILogger<WeatherForecastController> _logger;
         private readonly  Repository.Access.Base _baseController;
        private readonly IConfiguration _configuration;

        private static readonly string[] Summaries = new[]
        {
        "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
         };


        public WeatherForecastController(Repository.Access.Base baseController, IConfiguration configuration)
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
                //var VarConfig = _configuration.GetSection("config").GetSection(_configuration["siteMode"]);
                //string conexionString = VarConfig.GetSection("DefaultConnection").Value;
                //db = new Repository.SqlServer.Database(conexionString);
                Data["Schema"] = "dbo";
                Data["Method"] = "uspObtenerEmpresas_skrs";

                var response =await _baseController.ConsultaSimpleAsync( Data);
                return StatusCode(200, response);

            }
            catch (Exception e)
            {
                return StatusCode(500, new { Error = e.Message });
            }
        }


        //[HttpPost("[action]")]
        //public IActionResult ReactivarRegistro([FromBody] Dictionary<string, string> Data)
        //{

        //    try
        //    {
        //        var response = _baseController.ConsultaSimpleDiccionarioAsync("Digitalizacion.usp_registroFinalizado_del", Data);
        //        return StatusCode(200, response);

        //    }
        //    catch (Exception e)
        //    {
        //        return StatusCode(500, new { Error = e.Message });
        //    }
        //}




        //[HttpGet("[action]")]
        //public IActionResult DocsAseguradora([FromBody] Dictionary<string, string> Data)
        //{
        //    Repository.SqlServer.Database db;
        //    try
        //    {
        //          db = new Repository.SqlServer.Database(_configuration["DefaultConnection"]);

        //        var response = db.ConsultaSimpleDiccionarioAsync("Digitalizacion.usp_DocumentoAseguradora_skrs", Data);
        //        return StatusCode(200, response);

        //    }
        //    catch (Exception e)
        //    {
        //        return StatusCode(500, new { Error = e.Message });
        //    }
           
        //}
        public void Dispose()
        { 
            // Suppress finalization.
            GC.SuppressFinalize(this);
        }

    }


    public class model
    {
        public int? IdEmpresa   { get; set; } 

        public string? Empresa { get; set; }
    }
}
