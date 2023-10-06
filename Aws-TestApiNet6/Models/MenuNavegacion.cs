namespace Aws_TestApiNet6.Models
{
    public class MenuNavegacionItem
    {
        public string id { get; set; }
        public string title { get; set; }
        public string type { get; set; }
        public string url { get; set; }
        public string icon { get; set; }
        public int idOpcion { get; set; }
        public int idMenuSuperior { get; set; }
        public int idTipo { get; set; }
        public string link { get; set; }

        public List<MenuNavegacionItem> children { get; set; }
    }

    public class MenuNavegacion : MenuNavegacionItem
    {
        public List<MenuNavegacionItem> Children { get; set; }
    }
}