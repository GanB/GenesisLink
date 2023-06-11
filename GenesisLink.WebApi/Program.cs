using GenesisLink.BOL;
using GenesisLink.DAL;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System.Runtime.Intrinsics.X86;

namespace GenesisLink.WebApi
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);
            IConfiguration configuration = builder.Configuration;

            builder.Services.AddDbContext<AppDbContext>(options => options.UseSqlServer(
                configuration.GetConnectionString("LocalConnection")));

            builder.Services.AddIdentity<AppUser, IdentityRole>()
                .AddEntityFrameworkStores<AppDbContext>()
                .AddDefaultTokenProviders();

            // Add services to the container.

            builder.Services.AddCors();
            builder.Services.AddControllers();


            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle

            builder.Services.AddSwaggerGen();

            builder.Services.AddEndpointsApiExplorer();


            builder.Services.ConfigureApplicationCookie(opt =>
            {
                opt.Events = new CookieAuthenticationEvents()
                {
                    //Authentication
                    OnRedirectToLogin = redirectContext =>
                    {
                        redirectContext.HttpContext.Response.StatusCode = 403;
                        return Task.CompletedTask;
                    },
                    OnRedirectToAccessDenied = redirectContext =>
                    {
                        redirectContext.HttpContext.Response.StatusCode = 401;
                        return Task.CompletedTask;
                    }
                };
            });

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }
            else
            {
                app.UseDefaultFiles();
                app.UseStaticFiles();
            }

            app.UseHttpsRedirection();

            app.UseCors(x => x.WithOrigins(configuration.GetSection("App:Origins").GetChildren().Select(x => x.Value).ToArray())
                              .AllowAnyMethod()
                              .AllowAnyHeader()
                              .AllowCredentials());

            //app.UseCors(x => x.WithOrigins("http://localhost:4010")
            //                  .AllowAnyMethod()
            //                  .AllowAnyHeader()
            //                  .AllowCredentials());

            app.UseAuthentication();
            app.UseAuthorization();

            //CreateRoles(serviceProvider);


            app.MapControllers();

            app.Run();
        }
    }


}