using Microsoft.AspNetCore.Cors.Infrastructure;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;

var corsPolicy = "Policy";
var builder = WebApplication.CreateBuilder(args);
string[] origins = builder.Configuration.GetSection("Origins").AsEnumerable().Where(x => x.Value != null).Select(x => x.Value).ToArray();


// Add services to the container.

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
        builder.WithOrigins(origins);
    });
});

builder.Services.AddSingleton(p =>
{
    string siteMode = builder.Configuration["siteMode"];
    var VarConfig = builder.Configuration.GetSection("config").GetSection(siteMode);
    string conexionString = VarConfig.GetSection("DefaultConnection").Value;
    bool linkedServerActivo = Boolean.Parse(VarConfig.GetSection("LinkedServer").GetSection("Activo").Value);
    string? linkedServer = null;
    if (linkedServerActivo)
        linkedServer = VarConfig.GetSection("LinkedServer").GetSection("Name").Value;
    return new Repository.Access.Base(Repository.Access.Base.ConnectionType.Default, conexionString, linkedServer);
});

builder.Services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();


builder.Services.AddEndpointsApiExplorer();
var app = builder.Build();


// Configure the HTTP request pipeline.
//if (!app.Environment.IsDevelopment())
//{
//    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
//    app.UseHsts();
//}

app.UseHttpsRedirection();
//app.UseStaticFiles();
app.UseRouting();
app.UseCors(corsPolicy);
app.MapGet("/", () => "Hello World!");
app.MapControllerRoute(
    name: "default",
    pattern: "{controller}/{action=Index}/{id?}");

//app.MapFallbackToFile("index.html"); 

app.Run();
