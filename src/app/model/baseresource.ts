export interface BaseResource {

  id: string;
  uri: string;
  codeValue: string;
  modified: string;
  prefLabels: {
    fi: string,
    en: string,
    sv: string
  };
  definitions: {
    fi: string,
    en: string,
    sv: string
  };
}
