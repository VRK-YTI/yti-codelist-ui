import { Localizable } from 'yti-common-ui/types/localization';
import { BaseResourceType } from '../services/api-schema';

export abstract class AbstractResource implements BaseResourceType {

  id: string;
  uri: string;
  codeValue: string;
  modified: string;
  prefLabel: Localizable;
}
