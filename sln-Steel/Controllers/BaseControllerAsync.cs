using System.Collections.Generic;
using System.Threading.Tasks;


namespace sln_Steel.Controllers
{
    public partial class BaseController
    {
        public async Task<Dictionary<string, object>> ConsultaMultipleAsync(Dictionary<string, string> datos)
        {
            return await Task.Run(() =>
            {
                return this.ConsultaMultiple(datos);
            });
        }

        public async Task<List<Dictionary<string, object>>> ConsultaSimpleAsync(Dictionary<string, string> datos)
        {
            return await Task.Run(() =>
            {
                return this.ConsultaSimple(datos);
            });
        }
    }
}
