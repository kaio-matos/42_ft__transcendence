let language = "pt";

/**
 * @typedef {Record<
 *     'home_form_registration_button' |
 *     'home_form_registration_input_name_label' |
 *     'error_home_form_registration_missing_name'
 *     , string>} Language
 */

/** @type {Language} */
const en = {
  home_form_registration_button: "Register",
  home_form_registration_input_name_label: "Name",
  error_home_form_registration_missing_name: "Please provide your name",
};

/** @type {Language} */
const pt = {
  home_form_registration_button: "Registrar",
  home_form_registration_input_name_label: "Nome",
  error_home_form_registration_missing_name: "Por favor preencha o seu nome",
};

/**
 * @returns {Language}
 */
export function t() {
  return (
    {
      en,
      pt,
    }[language] ?? en
  );
}
