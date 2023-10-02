using iTextSharp.text;
using iTextSharp.text.pdf;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using Repository.Data.Repositories.Default;
using System;
using System.Collections.Generic;
using System.Data;
using System.IdentityModel.Tokens.Jwt;
using System.IO;
using System.Net;
using System.Security.Claims;
using System.Text;


namespace sln_Steel.Controllers
{

    public partial class BaseController : ControllerBase
    {
        public string conexionString;
        public string IdEmpresa;
        public string NombreEmpresa;
        public string Logo;
        public string IdUsuario;
        public string siteMode;
        public string pathAssets;
        public string IdAplicacion;
        public string siteModeBbva, affiliation_bbva, Api_Key_bbva, Merchant_id, linkedServer;
        public bool Bbva_IsProduction;
        public int daysFromExpirationOrder = 7;

        public readonly IConfiguration Config;

        public enum TypeConnection
        {
            Default,
            Hospital,
            Steel,
            Seguridad 
        }

        public TypeConnection typeConnection = TypeConnection.Default;

        public BaseController(IConfiguration _Config, TypeConnection tc)
        {
            Config = _Config;
            typeConnection = tc;
            try
            {
                siteMode = Config.GetSection("siteMode").Value;
                IdAplicacion = Config.GetSection("IdAplicacion").Value.ToString();
                var VarConfig = Config.GetSection("config").GetSection(siteMode);
                //conexionString = VarConfig.GetSection("DefaultConnection").Value;
                switch (typeConnection)
                {
                    case TypeConnection.Hospital:
                        {
                            conexionString = VarConfig.GetSection("HospitalConnection").Value;
                            break;
                        }
                    case TypeConnection.Steel:
                        {
                            conexionString = VarConfig.GetSection("SteelConnection").Value;
                            break;
                        }
                    case TypeConnection.Seguridad:
                        {
                            conexionString = VarConfig.GetSection("SeguridadConnection").Value;
                            break;
                        } 
                    default:
                        {
                            conexionString = VarConfig.GetSection("DefaultConnection").Value;
                            break;
                        }
                }


                try
                {
                    //LinkedServer
                    bool linkedServerActivo = Boolean.Parse(VarConfig.GetSection("LinkedServer").GetSection("Activo").Value);
                    linkedServer = null;
                    if (linkedServerActivo)
                        linkedServer = VarConfig.GetSection("LinkedServer").GetSection("Name").Value;
                }
                catch (Exception)
                {

                }

            }
            catch (Exception ex)
            {
                throw ex;
            }

        }



        public string QuitarAcentos(string input)
        {
            string stFormD = input.Normalize(NormalizationForm.FormD);
            int len = stFormD.Length;
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < len; i++)
            {
                System.Globalization.UnicodeCategory uc = System.Globalization.CharUnicodeInfo.GetUnicodeCategory(stFormD[i]);
                if (uc != System.Globalization.UnicodeCategory.NonSpacingMark)
                {
                    sb.Append(stFormD[i]);
                }
            }
            return (sb.ToString().Normalize(NormalizationForm.FormC));
        }

        public Dictionary<string, object> ConsultaMultiple(Dictionary<string, string> datos)
        {
            DefaultRepository repository;
            DataSet ds;
            Dictionary<string, object> response;
            try
            {
                repository = new DefaultRepository(conexionString);
                response = new Dictionary<string, object>();
                repository.Timeout = 800;

                if (!datos.ContainsKey("IdEmpresa"))
                    datos["IdEmpresa"] = IdEmpresa;

                try
                {
                    //LinkedServer
                    var VarConfig = Config.GetSection("config").GetSection(siteMode);
                    bool linkedServerActivo = Boolean.Parse(VarConfig.GetSection("LinkedServer").GetSection("Activo").Value);

                    if (linkedServerActivo)
                        datos["LinkedServer"] = VarConfig.GetSection("LinkedServer").GetSection("Name").Value;
                }
                catch (Exception)
                {

                }


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
            DefaultRepository repository;
            List<Dictionary<string, object>> response;
            try
            {
                repository = new DefaultRepository(conexionString);
                response = new List<Dictionary<string, object>>();
                repository.Timeout = 800;

                if (!datos.ContainsKey("IdEmpresa"))
                    datos["IdEmpresa"] = IdEmpresa;

                try
                {
                    //LinkedServer
                    var VarConfig = Config.GetSection("config").GetSection(siteMode);
                    bool linkedServerActivo = Boolean.Parse(VarConfig.GetSection("LinkedServer").GetSection("Activo").Value);

                    if (linkedServerActivo)
                        datos["LinkedServer"] = VarConfig.GetSection("LinkedServer").GetSection("Name").Value;
                }
                catch (Exception)
                {

                }

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


        // COMPROBAMOS SI EL USUARIO EXISTE EN LA BASE DE DATOS 
        public Dictionary<string, string> AutenticarUsuario(string email, string password, string idEmpresa, string idAplicacion)
        {
            // AQU� LA L�GICA DE AUTENTICACI�N //
            Dictionary<string, string> datos;
            DataTable objDataTable = null;
            DefaultRepository repository;
            try
            {
                repository = new DefaultRepository(conexionString);
                datos = new Dictionary<string, string>();
                datos["Usuario"] = email;
                datos["Password"] = password;
                datos["IdEmpresa"] = idEmpresa;
                datos["IdAplicacion"] = idAplicacion;
                datos["Method"] = "uspLogin_skrs";
                datos["Schema"] = "Seguridad";

                objDataTable = repository.ExecuteQuery(datos["Schema"] + "." + datos["Method"].ToString(), datos).Tables[0];

                Dictionary<string, string> row = new Dictionary<string, string>();

                foreach (DataRow dr in objDataTable.Rows)
                {
                    foreach (DataColumn col in objDataTable.Columns)
                    {
                        row.Add(col.ColumnName, dr[col].ToString());
                    }
                }
                return row;
            }
            catch (Exception)
            {
                throw;
            }


        }

        // GENERAMOS EL TOKEN CON LA INFORMACI�N DEL USUARIO
        public string GenerarTokenJWT(Dictionary<string, string> usuarioInfo)
        {
            try
            {
                // CREAMOS EL HEADER //
                var _symmetricSecurityKey = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(Config["JWT:ClaveSecreta"])
                    );
                var _signingCredentials = new SigningCredentials(
                        _symmetricSecurityKey, SecurityAlgorithms.HmacSha256
                    );
                var _Header = new JwtHeader(_signingCredentials);

                // CREAMOS LOS CLAIMS //
                var _Claims = new[] {
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(JwtRegisteredClaimNames.NameId, usuarioInfo["IdUsuario"].ToString()),
                new Claim("Nombre", usuarioInfo["Nombre"].ToString()),
                new Claim("ApellidoPaterno", usuarioInfo["ApellidoPaterno"].ToString()),
                new Claim(JwtRegisteredClaimNames.Email, usuarioInfo["Email"].ToString()),
                //new Claim(ClaimTypes.Role, "User"),
                new Claim(ClaimTypes.Role, (usuarioInfo.ContainsKey("Role") && usuarioInfo["Role"].ToString()!="")?usuarioInfo["Role"].ToString(): "User"), 
                //new Claim(ClaimTypes.Role, "SuperAdmin")
            };

                // CREAMOS EL PAYLOAD //
                var _Payload = new JwtPayload(
                        issuer: Config["JWT:Issuer"],
                        audience: Config["JWT:Audience"],
                        claims: _Claims,
                        notBefore: DateTime.UtcNow,
                        // Exipra a la 24 horas.
                        expires: DateTime.UtcNow.AddMinutes(int.Parse(Config["JWT:ExpirationMinutes"].ToString()))

                    );

                // GENERAMOS EL TOKEN //

                var _Token = new JwtSecurityToken(
                        _Header,
                        _Payload
                    );

                return new JwtSecurityTokenHandler().WriteToken(_Token);
            }
            catch (Exception)
            {

                throw;
            }
        }

        public List<Dictionary<string, object>> DeserializeObject(string json)
        {
            return JsonConvert.DeserializeObject<List<Dictionary<string, object>>>(json);
        }



        public string SerializeObject(List<Dictionary<string, object>> list)
        {
            return JsonConvert.SerializeObject(list);
        }

        static public string EncodeTo64(string toEncode)
        {
            byte[] toEncodeAsBytes = System.Text.ASCIIEncoding.ASCII.GetBytes(toEncode);
            string returnValue = System.Convert.ToBase64String(toEncodeAsBytes);
            return returnValue;
        }
        static public string DecodeFrom64(string encodedData)
        {
            byte[] encodedDataAsBytes = System.Convert.FromBase64String(encodedData);
            string returnValue = System.Text.ASCIIEncoding.ASCII.GetString(encodedDataAsBytes);
            return returnValue;
        }

        public Dictionary<string, string> GetBase64(string Url)
        {
            Dictionary<string, string> response;
            try
            {
                response = new Dictionary<string, string>();


                FileInfo fi = new FileInfo(Url);
                if (!fi.Exists)
                    throw new Exception("El archivo no existe");
                WebClient myWebClient = new WebClient();
                byte[] myDataBuffer = myWebClient.DownloadData(Url);
                string xml = myWebClient.DownloadString(Url);
                String file = Convert.ToBase64String(myDataBuffer);
                response["base64"] = file;
                response["xml"] = xml;
                response["extension"] = fi.Extension.ToString();

                return response;
            }
            catch (Exception)
            {
                throw;
            }


        }

        public string GetBase64String(string Url)
        {
            try
            {
                WebClient myWebClient = new WebClient();
                byte[] myDataBuffer = myWebClient.DownloadData(Url);
                return Convert.ToBase64String(myDataBuffer);
            }
            catch (Exception)
            {
                throw;
            }


        }

        public string GetBase64Merge(string Url)
        {
            try
            {
                string[] arrFilesSynapse = Url.Split('|');
                List<byte[]> pdfByteContent = new List<byte[]>();
                foreach (string file in arrFilesSynapse)
                {
                    string auxFile = file.Trim();
                    if (auxFile.Length > 0)
                    {
                        using (WebClient webClient = new WebClient())
                        {
                            pdfByteContent.Add(webClient.DownloadData(auxFile));
                        }
                    }
                }
                return Convert.ToBase64String(concatAndAddContent(pdfByteContent));

            }
            catch (Exception)
            {
                throw;
            }
        }


        public static byte[] concatAndAddContent(List<byte[]> pdfByteContent)
        {

            using (var ms = new MemoryStream())
            {
                using (var doc = new Document())
                {
                    using (var copy = new PdfSmartCopy(doc, ms))
                    {
                        doc.Open();

                        //Loop through each byte array
                        foreach (var p in pdfByteContent)
                        {

                            //Create a PdfReader bound to that byte array
                            using (var reader = new PdfReader(p))
                            {

                                //Add the entire document instead of page-by-page
                                copy.AddDocument(reader);
                            }
                        }

                        doc.Close();
                    }
                }

                //Return just before disposing
                return ms.ToArray();
            }
        }
    }
}
