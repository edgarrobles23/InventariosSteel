using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Repository.Access;

namespace Aws_TestApiNet6.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [AllowAnonymous]
    public class CatalogoController : ControllerBase
    {

        private readonly Base _baseController;
        private readonly IConfiguration _configuration;

        public CatalogoController(Base baseController, IConfiguration configuration)
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

        [HttpGet("[action]")]
        public async Task<IActionResult> ListEmpresas()
        {
            Dictionary<string, string> data;

            try
            {
                data = new Dictionary<string, string>();
                data["Method"] = "uspObtenerEmpresas_skrs";
                data["Schema"] = "dbo";
                var response = await _baseController.ConsultaSimpleAsync(data);
                return StatusCode(200, response);
            }
            catch (Exception e)
            {
                return StatusCode(500, new { Error = e.Message });
            }

        }
    }
}