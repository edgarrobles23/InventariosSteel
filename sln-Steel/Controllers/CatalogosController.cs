using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Repository.Access;
using sln_Steel.Utilities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;


namespace sln_Steel.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CatalogosController : BaseController
    {

        private readonly Base _baseApi;
        private readonly Seguridad _seguridad;
        private readonly IConfiguration _config;

        public CatalogosController(Base baseApi, IConfiguration config, Seguridad seguridad):base(config, TypeConnection.Seguridad)
        {
            _baseApi = baseApi;
            _seguridad = seguridad;
            _config = config;
        }
        [HttpGet("[action]")]
        [AllowAnonymous]
        public async Task<IActionResult> ListEmpresas()
        {
            Dictionary<string, string> data;

            try
            {
                data = new Dictionary<string, string>();
                data["Method"] = "uspObtenerEmpresas_skrs"; 
                data["Schema"] = "dbo";
                var response = await ConsultaSimpleAsync(data);
                return StatusCode(200, response);
            }
            catch (Exception e)
            {
                return StatusCode(500, new { Error = e.Message });
            }

        } 
       
 


    }
}