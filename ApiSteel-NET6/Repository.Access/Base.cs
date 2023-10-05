using Repository.Data;
using System;
using System.Collections.Generic;
using System.Data; 
using System.Security.Claims;
using System.Text;


namespace Repository.Access
{
    public partial class Base
    {
        private string conexionString;
        private string? linkedServer;

        public enum ConnectionType
        {
            Default,
            Hospital,
            CentroMezclas,
            Contabilidad,
            OrdenesCompra,
            appCompras
        }

        private ConnectionType connectionType = ConnectionType.Default;

        public Base(ConnectionType tc, string connectionString, string? LinkedServer = null)
        {
            connectionType = tc;
            conexionString = connectionString;
            linkedServer = LinkedServer;
        }

        public Dictionary<string, object> ConsultaMultiple(Dictionary<string, string> datos)
        {
            DefaultRepository? repository;
            DataSet? ds;
            Dictionary<string, object>? response;
            try
            {
                repository = new DefaultRepository(conexionString);
                response = new Dictionary<string, object>();
                repository.Timeout = 800;

                if (this.linkedServer != null)
                    datos["LinkedServer"] = this.linkedServer;

                ds = repository.ConsultaMultiple(datos);

                if (ds.Tables.Count > 0)
                {
                    for (int i = 0; i < ds.Tables.Count; i++)
                        response.Add(i.ToString(), DataTableToMap(ds.Tables[i]));
                }
                return response;

            }
            catch (Exception)
            {

                throw;
            }
            finally
            {
                ds = null;
                response = null;
                repository = null;
            }
        }
        public List<Dictionary<string, object>> ConsultaSimple(Dictionary<string, string> datos)
        {
            DefaultRepository? repository;
            List<Dictionary<string, object>>? response;
            try
            {
                repository = new DefaultRepository(conexionString);
                response = new List<Dictionary<string, object>>();
                repository.Timeout = 800;

                if (this.linkedServer != null)
                    datos["LinkedServer"] = this.linkedServer;

                response = repository.ConsultaSimple(datos);

                return response;
            }
            catch (Exception)
            {

                throw;
            }
            finally
            {
                repository = null;
                response = null;
            }
        }
        public List<Dictionary<string, object>> DataTableToMap(DataTable p_dt)
        {
            List<Dictionary<string, object>> maps = new List<Dictionary<string, object>>();
            Dictionary<string, object> row;

            foreach (DataRow dr in p_dt.Rows)
            {
                row = new Dictionary<string, object>();

                foreach (DataColumn col in p_dt.Columns)
                {
                    row.Add(col.ColumnName, dr[col]);
                }

                maps.Add(row);
            }

            return maps;
        }

 
    }
}
