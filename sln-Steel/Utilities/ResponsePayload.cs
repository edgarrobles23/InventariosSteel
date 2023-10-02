using System;
using System.Collections.Generic;

namespace sln_Steel.Utilities
{
    public class ResponsePayload
    {
        public string Mensaje { get; set; }
        public string Error { get; set; }
        public Exception Exception { get; set; }
        public object Payload { get; set; }

        public ResponsePayload(string mensaje, string error, Dictionary<string, object> payload)
        {
            Mensaje = mensaje;
            Error = error;
            Payload = payload;
        }

        public ResponsePayload(string mensaje, Dictionary<string, object> payload)
        {
            Mensaje = mensaje;
            Payload = payload;
        }

        public ResponsePayload(Dictionary<string, object> payload, string error)
        {
            Error = error;
            Payload = payload;
        }

        public ResponsePayload(Dictionary<string, object> payload)
        {
            Payload = payload;
        }

        public ResponsePayload(List<Dictionary<string, object>> payload)
        {
            Payload = payload;
        }

        public ResponsePayload(object payload)
        {
            Payload = payload;
        }

        public ResponsePayload(string error)
        {
            Error = error;
        }

        public ResponsePayload(Exception ex)
        {
            Exception = ex;
        }
    }
}
