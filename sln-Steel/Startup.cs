using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SpaServices.AngularCli;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json.Serialization;
using sln_Steel.Controllers;
using sln_Steel.Middlewares;
using sln_Steel.Utilities;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;

namespace sln_Steel

{
    public class Startup
    {
        public Microsoft.AspNetCore.Http.CookieSecurePolicy Secure { get; set; }
        public IConfigurationRoot ConfigurationRoot { get; }
        public IHostingEnvironment HostingEnvironment { get; private set; }
        public IConfiguration Configuration { get; }
        public IServiceProvider ServiceProvider { get; private set; }
        public string ValidIssuer { get; private set; }
        public string ValidAudience { get; private set; }
        private string corsPolicy = "DHPolicy";

        public Startup(IConfiguration configuration, IHostingEnvironment env)
        {
            this.HostingEnvironment = env;
            this.Configuration = configuration;
        }


        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            string[] origins = Configuration.GetSection("Origins").AsEnumerable().Where(x => x.Value != null).Select(x => x.Value).ToArray(); 
            
            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = CreateTokenValidationParameters();
                });
            services.AddCors(opt =>
            {
                opt.AddPolicy(corsPolicy, builder =>
                {
                    builder.AllowAnyHeader();
                    builder.AllowAnyMethod();
                    builder.AllowCredentials();
                    builder.WithOrigins(origins);
                });
            });

            /**
             * Inicio de la aplicacion desde el mismo dominio
             */
            services.AddSpaStaticFiles(configuration =>
            {
                configuration.RootPath = "app/dist";
            });


            // A�ADIR LOS SERVICIOS DE SESI�N.
            services.AddDistributedMemoryCache();
            services.AddAppServices();
            services.AddSession();
            services.AddSingleton(p =>
            {
                string siteMode = Configuration.GetSection("siteMode").Value;
                var VarConfig = Configuration.GetSection("config").GetSection(siteMode);
                string conexionString = VarConfig.GetSection("DefaultConnection").Value;

                bool linkedServerActivo = Boolean.Parse(VarConfig.GetSection("LinkedServer").GetSection("Activo").Value);
                string linkedServer = null;
                if (linkedServerActivo)
                    linkedServer = VarConfig.GetSection("LinkedServer").GetSection("Name").Value;


                return new Repository.Access.Base(Repository.Access.Base.ConnectionType.Default, conexionString, linkedServer);
            });
            services.AddSingleton(p => new BaseController(Configuration, BaseController.TypeConnection.Default));
            services.AddSingleton<Seguridad>();
            services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
            services.AddSingleton<Email>(p => new Email(Configuration["Smtp:Host"], Configuration["Smtp:Email"], Configuration["Smtp:Password"], Convert.ToInt32(Configuration["Smtp:Port"])));
            services
                .AddMvc()
                .SetCompatibilityVersion(CompatibilityVersion.Latest)
                .AddSessionStateTempDataProvider()
                 .AddJsonOptions(options => options.SerializerSettings.ContractResolver = new DefaultContractResolver());

            services.AddSignalR();//Configuracion del timepo real

            //registro de los hubs  
            //services.AddHostedService<Hosted.HostedService>() 

        }

        private TokenValidationParameters CreateTokenValidationParameters()
        {

            var result = new TokenValidationParameters
            {
                ValidateIssuer = false,
                ValidIssuer = ValidIssuer,

                ValidateAudience = false,
                ValidAudience = ValidAudience,

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

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(
            IApplicationBuilder app,
            IHostingEnvironment env,
            ILoggerFactory loggerFactory,
            IServiceProvider svp)
        {
            loggerFactory.AddConsole(Configuration.GetSection("Logging"));
            loggerFactory.AddDebug();

            ServiceProvider = svp;
            System.Web.HttpContext.ServiceProvider = svp;
            System.Web.Hosting.HostingEnvironment.m_IsHosted = true;

            System.Web.HttpContext.Configure(app.ApplicationServices.GetRequiredService<Microsoft.AspNetCore.Http.IHttpContextAccessor>());

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Error");
                app.UseHsts();
            }


            app.UseVerificationToken();

            //levantar la aplicacion en el mismo lugar
            app.UseStaticFiles();
            app.UseSpaStaticFiles();


            app.UseAuthentication();

            app.UseCors(corsPolicy);
            // A�ADIR LA SESI�N DEBE IR SIEMPRE ANTES DE app.UseMvc
            //app.UseSession();

            //app.UseSignalR(routes =>
            //{
            //    routes.MapHub<ChatHub>("/api/hub/chat");
            //    routes.MapHub<ConektaHub>("/api/hub/conektaHub");
            //});
            //app.UseHttpsRedirection();

            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "default",
                    template: "{controller}/{action=Index}/{id?}");
            });

            //Usar la aplicacion en el mismo sitio
            app.UseSpa((spa) =>
            {
                // To learn more about options for serving an Angular SPA from ASP.NET Core,
                // see https://go.microsoft.com/fwlink/?linkid=864501

                spa.Options.SourcePath = "app";

                if (env.IsDevelopment())
                {

                    //spa.UseAngularCliServer(npmScript: "dh");
                }
            });
        }
    }
}