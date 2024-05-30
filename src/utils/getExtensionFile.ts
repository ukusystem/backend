export function getExtesionFile (fileName: string){
    let partesNombre = fileName.split('.');
    return partesNombre[partesNombre.length - 1];
}