using Microsoft.AspNetCore.Cors.Infrastructure;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using Repository.Access;
using Aws_TestApiNet6.Utilities;
using Aws_TestApiNet6.Middlewares;

var corsPolicy = "Policy";

var builder = WebApplication.CreateBuilder(args);

string[] origins = builder.Configuration.GetSection("Origins").AsEnumerable().Where(x => x.Value != null).Select(x => x.Value).ToArray();
builder.Services.AddControllersWithViews();

builder.Services.AddCors(opt =>
{
    opt.AddPolicy(corsPolicy, builder =>
    {
        builder.AllowAnyHeader();
        builder.AllowAnyMethod();
        builder.AllowCredentials();
        builder.WithOrigins(origins);
    });
});

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
              .AddJwtBearer(options =>
              {
                  options.TokenValidationParameters = CreateTokenValidationParameters();
              });

TokenValidationParameters CreateTokenValidationParameters()
{
    var result = new TokenValidationParameters
    {
        ValidateIssuer = false,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],

        ValidateAudience = false,
        ValidAudience = builder.Configuration["Jwt:Audience"],

        ValidateIssuerSigningKey = false,
        SignatureValidator = delegate (string token, TokenValidationParameters parameters)
        {
            var jwt = new JwtSecurityToken(token);
            return jwt;
        },

        RequireExpirationTime = true,
        ValidateLifetime = true,

        ClockSkew = TimeSpan.Zero,
    };

    result.RequireSignedTokens = false;

    return result;
}

builder.Services.AddCors(opt =>
{
    opt.AddPolicy(corsPolicy, builder =>
    {
        builder.AllowAnyHeader();
        builder.AllowAnyMethod();
        builder.AllowCredentials();
        builder.WithOrigins("*");
    });
});

builder.Services.AddSingleton(p =>
{
    string siteMode = builder.Configuration["siteMode"];
    var VarConfig = builder.Configuration.GetSection("config").GetSection(siteMode);
    string? conexionString = VarConfig.GetSection("DefaultConnection").Value;
    var ls = VarConfig.GetSection("LinkedServer");
    string? linkedServer = null;

    if (ls != null && ls.GetSection("Activo").Value != null)

        if (Convert.ToBoolean(ls.GetSection("Activo").Value) == true)
            linkedServer = VarConfig.GetSection("LinkedServer").GetSection("Name").Value;

    return new Base(Base.ConnectionType.Default, conexionString, linkedServer);
});
builder.Services.AddSingleton<Seguridad>();

builder.Services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();


builder.Services.AddEndpointsApiExplorer();
var app = builder.Build();
app.UseAuthentication();
app.UseAuthorization();

app.UseMiddleware<TokenMiddleware>();// app.UseHttpsRedirection();

var games = new[]
{
    "call of duty", "free fire", "doom", "half life", "team fortress", "apex legends"
};
app.MapGet("/", () => "Welcome to API InventariosSteel AWS !");
app.MapGet("/api/games", () => games);
app.MapControllerRoute(
    name: "default",
    pattern: "{controller}/{action=Index}/{id?}");

app.Run();