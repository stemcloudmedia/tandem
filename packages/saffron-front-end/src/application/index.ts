import BaseApplication from 'saffron-common/src/application/base';
import IFrontEndApplication from './interface';

import fragments from './fragments';

export default class BrowserApplication extends BaseApplication implements IFrontEndApplication {

  public selection:any;
  
  _registerFragments() {
    super._registerFragments();
    this.fragments.register(...fragments);
  }
}