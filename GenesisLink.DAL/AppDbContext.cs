using GenesisLink.BOL;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace GenesisLink.DAL
{
    public class AppDbContext : IdentityDbContext
    {
        //private readonly string _connectionString;
        //public AppDbContext(IConfiguration configuration)
        //{
        //    _connectionString = configuration.GetConnectionString("LocalDbConnection");
        //}
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            base.OnConfiguring(optionsBuilder);
            //optionsBuilder.UseSqlServer(_connectionString);
            optionsBuilder.UseSqlServer("server=THINKPAD-P53\\MSSQLSERVER2022;database=GenesisLink;integrated security=true;Encrypt=True;TrustServerCertificate=True");
        }

        public DbSet<AppUser>? AppUsers { get; set; }
    }
}