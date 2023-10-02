/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-var */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { isDevMode } from '@angular/core';
import { HospitalModel } from 'app/models/general.models';
import { globalConst } from 'app/app.config';

export function GetLogo(IdEmpresa: number) {
  var img = new Image();
  var logo_url: string = '';
  switch (IdEmpresa) {
    case 1:
      logo_url = 'OCA_Logo.png';
      break;
    case 2:
      logo_url = 'DH_Logo.png';
      break;
    case 8:
      logo_url = 'DH_East_logo.png';
      break;
  }

  if (!isDevMode()) {
    img.src = globalConst.UrlFolder + '/assets/images/logo/' + logo_url;
  } else {
    img.src = '../../assets/images/logo/' + logo_url;
  }
  return img;
}
