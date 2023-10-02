using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Repository.Access;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace sln_Steel.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ProfileController : ControllerBase
    {
        private readonly Base _baseController;
        private readonly IHttpContextAccessor _contextAccessor;
        public ProfileController(Base baseController, IHttpContextAccessor contextAccessor)
        {
            _baseController = baseController;
            _contextAccessor = contextAccessor;
        }

        // POST: api/Profile
        [HttpPost("[action]")]
        public async Task<IActionResult> Get([FromBody]Dictionary<string, string> data)
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



        // POST: api/GetDireccionesFiscales
        [HttpPost("[action]")]
        public async Task<IActionResult> UpdateProfile([FromBody]Dictionary<string, string> data)
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
