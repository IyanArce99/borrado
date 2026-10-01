export const THEME_STORAGE_KEY = "borrado-theme";

/**
 * Se inyecta en <head> y se ejecuta antes del primer pintado: aplica el tema
 * guardado o, en la primera visita, el del sistema. Evita el parpadeo.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

export function toggleTheme() {
  const root = document.documentElement;
  const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
  root.setAttribute("data-theme", next);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch {
    // Almacenamiento no disponible (modo privado): el cambio vale para la sesión.
  }
}
