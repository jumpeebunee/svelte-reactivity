const DEV = true;

export function props_rest_readonly(property) {
  if (DEV) {
    const error = new Error(
      `props_rest_readonly\nRest element properties of \`$props()\` such as \`${property}\` are readonly`
    );
    error.name = "Svelte error";
    throw error;
  } else {
    throw new Error("props_rest_readonly");
  }
}
