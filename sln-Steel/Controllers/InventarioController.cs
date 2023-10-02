using iTextSharp.text.html;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Repository.Access; 
using sln_Steel.Utilities;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Mail;
using System.Threading.Tasks;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace sln_Steel.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class InventarioController : ControllerBase
    {

        private readonly Base _baseApi;
        private readonly Seguridad _seguridad;
        private readonly BaseController _baseController;
        private readonly IConfiguration _config;
        private readonly IHostingEnvironment _env;
        private Email _email;

        public InventarioController(Base baseApi, IConfiguration config, Seguridad seguridad, BaseController baseController, Email email, IHostingEnvironment env)
        {
            _baseApi = baseApi;
            _seguridad = seguridad;
            _baseController = baseController;
            _config = config;
            _email = email;
            _env = env;
        }

        [HttpPost("[action]")]
        public IActionResult GetInventario([FromBody]Dictionary<string, string> Data)
        {
             BaseController bc;
            try
            {
                bc = new BaseController(_config, BaseController.TypeConnection.Steel);
                Data["Schema"] = "dbo";
                Data["Method"] = "UspInventario_Skrs";

                var response = bc.ConsultaSimple(Data);
                return StatusCode(200, response);
            }
            catch (Exception e)
            {
                return StatusCode(500, new { Error = e.Message });
            }
            finally {
                bc = null;
            }
        }
       

    }
}
