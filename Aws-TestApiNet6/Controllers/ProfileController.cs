using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc; 
using Repository.Access;

namespace Aws_TestApiNet6.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProfileController : ControllerBase
    {

        private readonly Base _baseController; 

        public ProfileController(Base baseController )
        {
            _baseController = baseController; 
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            try
            {
                Dictionary<string, string> Data = new Dictionary<string, string>();
                Data["Respuesta"] = "GET ProfileController";
                return StatusCode(200, Data);

            }
            catch (Exception e)
            {
                return StatusCode(500, new { Error = e.Message });
            }
        }

        // POST: api/Profile
        [HttpPost("[action]")]
        public async Task<IActionResult> Get([FromBody] Dictionary<string, string> data)
        {
            try
            {
                data["Method"] = "uspProfileUsuario";
                data["Schema"] = "dbo";
                List<Dictionary<string, object>> responseData = await _baseController.ConsultaSimpleAsync(data);
                return StatusCode(200, responseData[0]);
            }
            catch (Exception e)
            {
                return StatusCode(500, new { Error = e.Message });
            }
        }
         
        [HttpPost("[action]")]
        public async Task<IActionResult> UpdateProfile([FromBody] Dictionary<string, string> data)
        {
            try
            {
                data["Method"] = "uspUpdateProfile_upd";
                data["Schema"] = "dbo";
                var response = await _baseController.ConsultaSimpleAsync(data);
                return StatusCode(200, response);
            }
            catch (Exception e)
            {
                return StatusCode(500, e.Message);
            }
        }
    }
}