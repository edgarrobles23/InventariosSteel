using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Repository.Access
{
    public partial class Base
    {

        public async Task<Dictionary<string, object>> ConsultaMultipleAsync(Dictionary<string, string> data)
        {
            return await Task.Run(() =>
            {
                return this.ConsultaMultiple(data);
            });
        }

        public async Task<List<Dictionary<string, object>>> ConsultaSimpleAsync(Dictionary<string, string> data)
        {
            return await Task.Run(() =>
            {
                return this.ConsultaSimple(data);
            });
        }

    }
}
