using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Aws_TestApiNet6.Models
{
    public class TokenValidator
    {
        private JwtSecurityTokenHandler _handler;
        private string _token;

        public TokenValidator(string token)
        {
            _handler = new JwtSecurityTokenHandler();
            if (_handler.CanReadToken(token))
            {
                _token = token;
            }
            else
            {
                throw new SecurityTokenException("No es un token genuino");
            }
        }

        public string Jti
        {
            get
            {
                SecurityToken token = _handler.ReadToken(this._token);
                return token.Id;
            }
        }

        public List<Claim> Claims
        {
            get
            {
                JwtSecurityToken securityToken = _handler.ReadToken(_token) as JwtSecurityToken;
                return securityToken.Claims.ToList();
            }
        }

        public DateTime FechaExpiracion
        {
            get
            {
                SecurityToken token = _handler.ReadToken(_token);
                return Convert.ToDateTime(token.ValidTo.ToLocalTime().ToString("yyyy-MM-dd HH:mm:ss"));
            }
        }

        public string Audience
        {
            get
            {
                List<Claim> claims = this.Claims;
                return claims.Where(claim => claim.Type == "aud").Select(claim => claim.Value).FirstOrDefault();
            }
        }

        public string Issuer
        {
            get
            {
                List<Claim> claims = this.Claims;
                return claims.Where(claim => claim.Type == "iss").Select(claim => claim.Value).FirstOrDefault();
            }
        }

        public int IdEmpresa
        {
            get
            {
                List<Claim> claims = Claims;
                return claims.Where(claim => claim.Type == "IdEmpresa").Select(claim => Convert.ToInt32(claim.Value)).FirstOrDefault();
            }
        }

        public int IdUsuario
        {
            get
            {
                return Claims.Where(claim => claim.Type == "IdUsuario").Select(claim => Convert.ToInt32(claim.Value)).FirstOrDefault();
            }
        }
        public string Email
        {
            get
            {
                return Claims.Where(claim => claim.Type == "Email").Select(claim => Convert.ToString(claim.Value)).FirstOrDefault();
            }
        }
    }
}
