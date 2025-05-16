import api from './axios'

export const obtenerEmpresasYSedes = async () => {
  const usuario = JSON.parse(localStorage.getItem('usuario'))
  const rol = usuario?.RolUsuario?.toLowerCase()

  if (rol === 'usuario') {
    // Si es usuario común, trae solo lo asignado
    const res = await api.get('/mis-empresas-sedes')
    return {
      empresas: res.data.empresas || [],
      sedes: res.data.sedes || []
    }
  }

  // Si es talento_humano u otro rol, trae todo
  const [resEmpresas, resSedes] = await Promise.all([
    api.get('/empresas'),
    api.get('/sedes')
  ])

  return {
    empresas: resEmpresas.data,
    sedes: resSedes.data
  }
}
