using Repository.Data.Base;
using System.Collections.Generic;
using System.Data;
namespace Repository.Data.Repositories.Default
{
    public class DefaultRepository : BaseRepository
    {


        #region Constructor      
        public DefaultRepository(string configuration) : base(configuration)
        {

        }
        #endregion

        #region "Consultas"
        /// <summary>
        /// LookUp de busqueda de un numero de lote, se debe tener un IdCargo para poder realizar la busqueda
        /// </summary>
        /// <param name="objParams">
        ///     IdCargo INT
        ///     NumeroLote STRING
        /// </param>
        /// <returns></returns>
        public DataSet ConsultaMultiple(Dictionary<string, string> objParams)
        {

            DataSet? ds;
            try
            {
                var schema = "dbo";

                if (objParams.ContainsKey("Schema"))
                    schema = objParams["Schema"].ToString();

                ds = ExecuteQuery(schema + "." + objParams["Method"].ToString(), objParams);
                return ds;
            }
            catch
            {
                throw;
            }
            finally
            {
                ds = null;
            }
        }


        public List<Dictionary<string, object>> ConsultaSimple(Dictionary<string, string> objParams)
        {
            List<Dictionary<string, object>> dictionaryResult;
            DataTable? objDataTable = null;

            try
            {
                var schema = "dbo";
                if (objParams.ContainsKey("Schema"))
                    schema = objParams["Schema"].ToString();



                objDataTable = ExecuteQuery(schema + "." + objParams["Method"].ToString(), objParams).Tables[0];
                dictionaryResult = DataTableToMap(objDataTable);
                return dictionaryResult;
            }
            catch
            {
                throw;
            }
            finally
            {
                dictionaryResult = null;

                if (objDataTable != null)
                    objDataTable.Dispose();
                objDataTable = null;
            }
        }


        #endregion
    }
}
