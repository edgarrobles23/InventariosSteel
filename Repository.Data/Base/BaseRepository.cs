using System;
using System.Collections.Generic; 
using System.Data;
using System.Data.SqlClient;
using System.Linq; 

namespace Repository.Data.Base
{
    public class BaseRepository
    {
        private string conexionString = string.Empty;
        public int idUsuario;
        public bool isDashboard = false;


        public Nullable<int> Timeout { get; set; }
        public Nullable<bool> OmitValidNullParameters { get; set; }

        public BaseRepository()
        {
        }
        public BaseRepository(string _conexionString)
        {
            conexionString = _conexionString;
        }




        public DataSet ExecuteQuery(string spName, Dictionary<string, string> objParams)
        {
            try
            {
                //if (isDashboard == false && HttpContext.Current.Session["IdUsuario"] == null && spName != "Seguridad.uspCatEmpresas_sk")
                //    throw new Exception("session-01");

                //bool acceso = ValidarAcceso(spName, objParams);

                bool acceso = true;

                if (acceso)
                {
                    DataSet ds = new DataSet();

                    using (SqlConnection conn = new SqlConnection(conexionString))
                    {
                        string sNomParametro = string.Empty;

                        conn.Open();

                        if (objParams.ContainsKey("LinkedServer") && (objParams["LinkedServer"] != null && objParams["LinkedServer"] != ""))
                        {
                            spName = objParams["LinkedServer"] + "." + spName;
                        }

                        using (SqlCommand cmd = new SqlCommand(spName, conn))
                        {
                            if (Timeout.HasValue)
                                cmd.CommandTimeout = Timeout.Value;

                            cmd.CommandType = CommandType.StoredProcedure;

                            SqlCommandBuilder.DeriveParameters(cmd);

                            foreach (SqlParameter param in cmd.Parameters)
                            {
                                if (param.Direction == ParameterDirection.Input || param.Direction == ParameterDirection.InputOutput)
                                {
                                    sNomParametro = param.ParameterName.Substring(1, param.ParameterName.Length - 1);
                                    //sNomParametro = param.ParameterName;

                                    foreach (KeyValuePair<string, string> entry in objParams)
                                    {
                                        if (entry.Key.ToString().ToLower() == sNomParametro.ToLower())
                                        {
                                            //Cuando se reciba un parámetro de tipo 'Structured' (Table) hay que asignar directamente el DataTable del diccionary
                                            if (param.SqlDbType == SqlDbType.Structured)
                                            {
                                                //List<Dictionary<string, object>> list = (List<Dictionary<string, object>>)(object)entry.Value;
                                                List<Dictionary<string, object>> list = Newtonsoft.Json.JsonConvert.DeserializeObject<List<Dictionary<string, object>>>(entry.Value);
                                                string[] TypeName = param.TypeName.ToString().Split('.');

                                                param.TypeName = TypeName[TypeName.Length - 1];
                                                //Preparacion de la consulta para ver el tipo de columnas en el Datatype
                                                var queryDatatype = @" SELECT  tt.name AS	Name, c.name as Parameter,type.Name Datatype  
                                                FROM sys.table_types tt
                                                INNER JOIN  sys.columns c ON c.object_id = tt.type_table_object_id
                                                INNER JOIN  sys.types type ON c.user_type_id = type.user_type_id";
                                                queryDatatype += " WHERE tt.name = '" + param.TypeName + "' ";
                                                queryDatatype += " ORDER BY c.column_id ";

                                                using (SqlCommand cmd2 = new SqlCommand(queryDatatype, conn))
                                                {
                                                    SqlDataAdapter da = new SqlDataAdapter(cmd2);
                                                    DataTable dtResult = new DataTable();  //Resultado de las columnas en BD
                                                    DataTable dtParameters = new DataTable(); //Nuevo para ejecutar el sp
                                                    dtParameters.Clear();

                                                    da.Fill(dtResult);
                                                    dtParameters = DictionaryToDataType(list, dtResult);

                                                    param.Value = dtParameters;
                                                }

                                                break;
                                            }
                                            else
                                            {
                                                param.Value = entry.Value == "null" ? null : entry.Value;
                                                break;
                                            }
                                        }
                                    }

                                    //Si el parámetro es de tipo numero y se recibio un '' desde codigo se envia null a la base de datos.
                                    if ((ToString(param.Value) == "") && (param.SqlDbType == SqlDbType.Int || param.SqlDbType == SqlDbType.Float || param.SqlDbType == SqlDbType.Decimal || param.SqlDbType == SqlDbType.SmallInt || param.SqlDbType == SqlDbType.TinyInt || param.SqlDbType == SqlDbType.Bit))
                                        param.Value = null;

                                    //Si no encontro ningun valor verificamos si es de los parámetros defaults.
                                    if (param.Value == null)
                                    {
                                        if (OmitValidNullParameters == null || OmitValidNullParameters == false)
                                        {
                                            if (sNomParametro.ToLower() == "namepcmod")
                                                param.Value = "NombrePc";

                                            //if (sNomParametro.ToLower() == "idusuario" && HttpContext.Current.Session["IdUsuario"] != null)
                                            //    param.Value = HttpContext.Current.Session["IdUsuario"] == null ? 0 : HttpContext.Current.Session["IdUsuario"];

                                            //if (sNomParametro.ToLower() == "idempresa" && System.Web.HttpContext!=null && HttpContext.Current.Session["IdEmpresa"] != null)
                                            //    param.Value = HttpContext.Current.Session["IdEmpresa"] == null ? 0 : HttpContext.Current.Session["IdEmpresa"];

                                            //if (sNomParametro.ToLower() == "idaplicacion" && HttpContext.Current.Session["IdAplicacion"] != null)
                                            //    param.Value = HttpContext.Current.Session["IdAplicacion"] == null ? 0 : HttpContext.Current.Session["IdAplicacion"];

                                        }
                                    }
                                }
                            }

                            SqlDataAdapter adp = new SqlDataAdapter(cmd);
                            adp.Fill(ds);
                        }

                        return ds;
                    }
                }
                else
                    throw new Exception("Acceso no autorizado para ejecutar esta acción.");
            }
            catch (Exception ex)
            {
                throw ex;
            }

        }

        public DataSet ExecuteFunction(string query)
        {
            DataSet ds = new DataSet();

            try
            {
                using (SqlConnection conn = new SqlConnection(conexionString))
                {
                    conn.Open();

                    using (SqlCommand cmd = new SqlCommand(query, conn))
                    {
                        if (Timeout.HasValue)
                            cmd.CommandTimeout = Timeout.Value;

                        SqlDataAdapter adp = new SqlDataAdapter(cmd);
                        adp.Fill(ds);
                    }
                }
                return ds;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        /// <summary>
        /// Sp que ejecuta un Sp de Insert, Update, Delete
        /// </summary>
        /// <param name="spName"></param>
        /// <param name="objParams"></param>
        public void ExecuteNonQuery(string spName, Dictionary<string, object> objParams)
        {
            try
            {
                //if (isDashboard == false && HttpContext.Current.Session["IdUsuario"] == null)
                //    throw new InvalidOperationException("session-01");

                //bool acceso = ValidarAcceso(spName, objParams);
                bool acceso = true;

                if (acceso)
                {
                    using (SqlConnection conn = new SqlConnection(conexionString))
                    {
                        string sNomParametro = string.Empty;
                        conn.Open();
                        if (objParams.ContainsKey("LinkedServer") && (objParams["LinkedServer"] != null))
                        {
                            spName = objParams["LinkedServer"] + "." + spName;
                        }

                        using (SqlCommand cmd = new SqlCommand(spName, conn))
                        {
                            if (Timeout.HasValue)
                                cmd.CommandTimeout = Timeout.Value;

                            cmd.CommandType = CommandType.StoredProcedure;
                            SqlCommandBuilder.DeriveParameters(cmd);

                            foreach (SqlParameter param in cmd.Parameters)
                            {
                                if (param.Direction == ParameterDirection.Input || param.Direction == ParameterDirection.InputOutput)
                                {
                                    sNomParametro = param.ParameterName.Substring(1, param.ParameterName.Length - 1);

                                    foreach (KeyValuePair<string, object> entry in objParams)
                                    {
                                        if (entry.Key.ToString().ToLower() == sNomParametro.ToLower())
                                        {
                                            if (sNomParametro.ToLower() != "namepcmod" && sNomParametro.ToLower() != "idioma" && sNomParametro.ToLower() != "audituserid")
                                            {
                                                //Cuando se reciba un parámetro de tipo 'Structured' (Table) hay que asignar directamente el DataTable del diccionary
                                                if (param.SqlDbType == SqlDbType.Structured)
                                                {
                                                    List<Dictionary<string, object>> list = (List<Dictionary<string, object>>)entry.Value;
                                                    string[] TypeName = param.TypeName.ToString().Split('.');

                                                    param.TypeName = TypeName[TypeName.Length - 1];
                                                    //Preparacion de la consulta para ver el tipo de columnas en el Datatype 
                                                    var queryDatatype = @" SELECT  tt.name AS	Name, c.name as Parameter,type.Name Datatype  
                                                    FROM sys.table_types tt
                                                    INNER JOIN  sys.columns c ON c.object_id = tt.type_table_object_id
                                                    INNER JOIN  sys.types type ON c.user_type_id = type.user_type_id";
                                                    queryDatatype += " WHERE tt.name = '" + param.TypeName + "' ";

                                                    using (SqlCommand cmd2 = new SqlCommand(queryDatatype, conn))
                                                    {
                                                        SqlDataAdapter da = new SqlDataAdapter(cmd2);
                                                        DataTable dtResult = new DataTable();  //Resultado de las columnas en BD
                                                        DataTable dtParameters = new DataTable(); //Nuevo para ejecutar el sp
                                                        dtParameters.Clear();

                                                        da.Fill(dtResult);
                                                        dtParameters = DictionaryToDataType(list, dtResult);

                                                        param.Value = dtParameters;
                                                    }

                                                    break;
                                                }
                                                else
                                                {
                                                    param.Value = entry.Value;
                                                    break;
                                                }
                                            }
                                            else
                                                param.Value = null;
                                        }
                                    }

                                    //Si el parámetro es de tipo numero y se recibio un '' desde codigo se envia null a la base de datos.
                                    if ((ToString(param.Value) == "") && (param.SqlDbType == SqlDbType.Int || param.SqlDbType == SqlDbType.Float || param.SqlDbType == SqlDbType.Decimal || param.SqlDbType == SqlDbType.SmallInt || param.SqlDbType == SqlDbType.TinyInt || param.SqlDbType == SqlDbType.Bit))
                                        param.Value = null;

                                    //Si no encontro ningun valor verificamos si es de los parámetros defaults.
                                    if (param.Value == null)
                                    {
                                        if (OmitValidNullParameters == null || OmitValidNullParameters == false)
                                        {
                                            if (sNomParametro.ToLower() == "namepcmod")
                                                param.Value = "NombrePc";

                                            //if (sNomParametro.ToLower() == "idusuario" && HttpContext.Current.Session["IdUsuario"] != null)
                                            //    param.Value = HttpContext.Current.Session["IdUsuario"] == null ? 0 : HttpContext.Current.Session["IdUsuario"];

                                            //if (sNomParametro.ToLower() == "idempresa" && HttpContext.Current.Session["IdEmpresa"] != null)
                                            //    param.Value = HttpContext.Current.Session["IdEmpresa"] == null ? 0 : HttpContext.Current.Session["IdEmpresa"];
                                        }
                                    }
                                }
                            }

                            cmd.ExecuteNonQuery();

                            var key = string.Empty;

                            foreach (SqlParameter param in cmd.Parameters)
                            {
                                if (param.Direction == ParameterDirection.Output || param.Direction == ParameterDirection.InputOutput)
                                {
                                    sNomParametro = param.ParameterName.Substring(1, param.ParameterName.Length - 1);

                                    foreach (KeyValuePair<string, object> entry in objParams)
                                    {
                                        if (entry.Key.ToString().ToLower() == sNomParametro.ToLower())
                                        {
                                            key = entry.Key.ToString();
                                            break;
                                        }
                                    }

                                    objParams[key] = param.Value.ToString();
                                }
                            }
                        }

                    }
                }
                else
                    throw new Exception("Acceso no autorizado para ejecutar esta acción.");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }



        private static string ToString(object value)
        {
            if (value is DBNull)
                return string.Empty;

            return Convert.ToString(value);
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

        public List<Dictionary<string, object>> DataSetToMap(DataSet p_ds)
        {
            List<Dictionary<string, object>> maps = new List<Dictionary<string, object>>();
            Dictionary<string, object> row;

            foreach (DataTable tbl in p_ds.Tables)
            {
                foreach (DataRow dr in tbl.Rows)
                {
                    row = new Dictionary<string, object>();

                    foreach (DataColumn col in tbl.Columns)
                    {
                        row.Add(col.ColumnName, dr[col]);
                    }

                    maps.Add(row);
                }
            }

            return maps;
        }

        public List<Dictionary<string, object>> DeserializeObject(string json)
        {
            System.Web.Script.Serialization.JavaScriptSerializer serializer = new System.Web.Script.Serialization.JavaScriptSerializer();
            List<Dictionary<string, object>> items = serializer.Deserialize<List<Dictionary<string, object>>>(json);
            return items;
        }
        public string SerializeObject(List<Dictionary<string, object>> list)
        {
            System.Web.Script.Serialization.JavaScriptSerializer serializer = new System.Web.Script.Serialization.JavaScriptSerializer();
            string items = serializer.Serialize(list);
            return items;
        }
        public static Dictionary<string, string> DeserializeOne(string json)
        {
            System.Web.Script.Serialization.JavaScriptSerializer serializer = new System.Web.Script.Serialization.JavaScriptSerializer();
            Dictionary<string, string> items = serializer.Deserialize<Dictionary<string, string>>(json);
            return items;
        }

        public static Dictionary<string, object> DeserializeOneObjectStatic(string json)
        {
            System.Web.Script.Serialization.JavaScriptSerializer serializer = new System.Web.Script.Serialization.JavaScriptSerializer();
            Dictionary<string, object> items = serializer.Deserialize<Dictionary<string, object>>(json);
            return items;
        }

        public Dictionary<string, object> DeserializeOneObject(string json)
        {
            System.Web.Script.Serialization.JavaScriptSerializer serializer = new System.Web.Script.Serialization.JavaScriptSerializer();
            Dictionary<string, object> items = serializer.Deserialize<Dictionary<string, object>>(json);
            return items;
        }
        public List<KeyValuePair<string, object>> DeserializeSingleObject(string json)
        {
            System.Web.Script.Serialization.JavaScriptSerializer serializer = new System.Web.Script.Serialization.JavaScriptSerializer();
            Dictionary<string, object> items = serializer.Deserialize<Dictionary<string, object>>(json);
            return items.ToList<KeyValuePair<string, object>>();
        }

        public KeyValuePair<string, object> DeserializeSingleProperty(string json)
        {
            System.Web.Script.Serialization.JavaScriptSerializer serializer = new System.Web.Script.Serialization.JavaScriptSerializer();
            Dictionary<string, object> items = serializer.Deserialize<Dictionary<string, object>>(json);
            return items.SingleOrDefault();
        }

        public DataTable DictionaryToTable(List<Dictionary<string, object>> items)
        {
            DataTable objDataTableDatos;
            var columnNames = items.SelectMany(dict => dict.Keys).Distinct();

            objDataTableDatos = new DataTable();
            objDataTableDatos.Columns.AddRange(columnNames.Select(c => new DataColumn(c)).ToArray());

            foreach (Dictionary<string, object> item in items)
            {
                var row = objDataTableDatos.NewRow();
                foreach (var key in item.Keys)
                {
                    row[key] = item[key];
                }

                objDataTableDatos.Rows.Add(row);
            }

            return objDataTableDatos;
        }

        public DataTable DictionaryToDataType(List<Dictionary<string, object>> items, DataTable dataTable)
        {
            DataTable objDataTableDatos;
            var columnNames = items.SelectMany(dict => dict.Keys).Distinct();

            objDataTableDatos = new DataTable();
            objDataTableDatos.Clear();

            foreach (DataRow dr in dataTable.Rows)
            {
                //objDataTableDatos.Columns.Add(dr["Parameter"].ToString(), typeMap[dr["Datatype"].ToString().ToLower()]);
                if (!objDataTableDatos.Columns.Contains(dr["Parameter"].ToString()))
                    objDataTableDatos.Columns.Add(dr["Parameter"].ToString());
            }

            foreach (Dictionary<string, object> item in items)
            {
                var row = objDataTableDatos.NewRow();

                foreach (var key in item.Keys)
                {
                    for (int i = 0; i < dataTable.Rows.Count; i++)
                    {
                        if (key == dataTable.Rows[i].ItemArray[1].ToString()) // la propiedad 1 es el Parametro en el 
                        {
                            if (dataTable.Rows[i].ItemArray[2].ToString() == "datetime" || dataTable.Rows[i].ItemArray[2].ToString() == "smalldatetime")
                                row[key] = Convert.ToDateTime(item[key]);
                            else
                                row[key] = item[key];

                            continue;
                        }
                    }
                }

                objDataTableDatos.Rows.Add(row);
            }

            return objDataTableDatos;
        }

        public Dictionary<string, object> GetEmailByIdArea(Dictionary<string, string> objParams)
        {
            //List<Dictionary<string, object>> dictionaryResult;
            DataTable objDataTable = null;

            try
            {
                objDataTable = ExecuteQuery("CentroMezclas.uspEmailsArea_sk", objParams).Tables[0];
                Dictionary<string, object> result = new Dictionary<string, object>();

                foreach (DataColumn col in objDataTable.Columns)
                {
                    result.Add(col.ColumnName, objDataTable.Rows[0][col]);
                }

                return result;
            }
            catch
            {
                throw new Exception("No se ha enviado el correo de notificación ya el area no tiene correo configurado, favor de comunicarse a desarrollo de sistemas.");
            }
            finally
            {

                if (objDataTable != null)
                    objDataTable.Dispose();

                objDataTable = null;
            }
        }
    }
}
