export interface Localization {
  lang: string;
  value: string;
}

export interface Localizable {
  [language: string]: string;
}
