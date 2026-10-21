import {
  React,
  type AllWidgetProps,
  DataSourceComponent,
  type FeatureLayerDataSource,
  type FeatureDataRecord
} from 'jimu-core'

const Widget = (props: AllWidgetProps<{}>) => {
  const dataSourceRef = React.useRef<FeatureLayerDataSource | null>(null)

  const [registro, setRegistro] = React.useState<FeatureDataRecord | null>(null)
  const [texto, setTexto] = React.useState('')
  const [guardando, setGuardando] = React.useState(false)
  const [estado, setEstado] = React.useState('')

  const idRegistro = registro?.getId()

  // Al cambiar el registro seleccionado, sincronizamos el contenido del campo Analisis
  React.useEffect(() => {
    if (registro) {
      const valor = registro.getFieldValue('Analisis')
      setTexto(valor !== undefined && valor !== null ? String(valor) : '')
      setEstado('')
    } else {
      setTexto('')
      setEstado('')
    }
  }, [idRegistro])

  const actualizarSeleccion = () => {
    const ds = dataSourceRef.current
    if (!ds) return

    const seleccionados = ds.getSelectedRecords() as FeatureDataRecord[]
    if (seleccionados && seleccionados.length > 0) {
      setRegistro(seleccionados[0])
    } else {
      setRegistro(null)
    }
  }

  const guardar = async () => {
    const ds = dataSourceRef.current

    if (!ds || !registro) {
      setEstado('Selecciona un registro antes de guardar.')
      return
    }

    try {
      setGuardando(true)
      setEstado('Guardando cambios en el servidor...')

      let layer = ds.layer
      if (!layer && (ds as any).createJSAPILayerByDataSource) {
        layer = await (ds as FeatureLayerDataSource).createJSAPILayerByDataSource()
      }

      if (!layer) {
        throw new Error('No se pudo acceder a la capa de destino.')
      }

      const campoId = layer.objectIdField || 'OBJECTID'
      const atributos = registro.getData().attributes || {}
      const objectId = atributos[campoId] ?? registro.getId()

      if (objectId === undefined || objectId === null) {
        throw new Error('No se pudo identificar el ID del registro seleccionado.')
      }

      const featureActualizado = {
        attributes: {
          [campoId]: Number(objectId),
          Analisis: texto
        }
      }

      // Guardado oficial mediante applyEdits de ArcGIS Maps SDK JS
      const resultado = await layer.applyEdits({
        updateFeatures: [featureActualizado]
      })

      const resultadoEdicion = resultado?.updateFeatureResults?.[0]

      if (resultadoEdicion?.error) {
        throw new Error(
          resultadoEdicion.error.message || 'El servicio de entidades rechazó la modificación.'
        )
      }

      // Actualizar el valor en el objeto local para evitar recargas
      if (registro.feature && registro.feature.attributes) {
        registro.feature.attributes.Analisis = texto
      }

      // Refrescar la fuente de datos si la API lo permite
      if (typeof ds.refresh === 'function') {
        ds.refresh()
      }

      setEstado('¡Análisis guardado correctamente!')
    } catch (error: any) {
      console.error('Error al guardar el campo Analisis:', error)
      setEstado(`Error al guardar: ${error?.message || 'Error desconocido.'}`)
    } finally {
      setGuardando(false)
    }
  }

  if (!props.useDataSources || props.useDataSources.length === 0) {
    return (
      <div className="jimu-widget" style={{ padding: 16 }}>
        Abre el panel de configuración del widget y selecciona la capa <strong>Locales Nuevos</strong> de <em>Mapa análisis</em>.
      </div>
    )
  }

  return (
    <div
      className="jimu-widget"
      style={{
        width: '100%',
        height: '100%',
        padding: 12,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }}
    >
      <DataSourceComponent
        useDataSource={props.useDataSources[0]}
        widgetId={props.id}
        onDataSourceCreated={(ds: FeatureLayerDataSource) => {
          dataSourceRef.current = ds
          actualizarSeleccion()
        }}
        onDataSourceInfoChange={() => {
          actualizarSeleccion()
        }}
      />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <strong>Análisis</strong>

        <button
          onClick={guardar}
          disabled={!registro || guardando}
          style={{
            border: 'none',
            borderRadius: 4,
            padding: '6px 16px',
            cursor: registro && !guardando ? 'pointer' : 'not-allowed',
            background: registro && !guardando ? '#007ac2' : '#cccccc',
            color: '#ffffff',
            fontWeight: 600
          }}
        >
          {guardando ? 'Guardando...' : 'OK'}
        </button>
      </div>

      {!registro ? (
        <div
          style={{
            color: '#666666',
            fontSize: 13,
            padding: 12,
            border: '1px dashed #cccccc',
            borderRadius: 4,
            textAlign: 'center'
          }}
        >
          Selecciona un registro con el buscador para redactar su análisis.
        </div>
      ) : (
        <textarea
          value={texto}
          onChange={(event) => {
            setTexto(event.target.value)
            setEstado('')
          }}
          placeholder="Escribe aquí tu análisis..."
          style={{
            width: '100%',
            flex: 1,
            minHeight: 80,
            padding: 8,
            border: '1px solid #cccccc',
            borderRadius: 4,
            background: 'transparent',
            color: 'inherit',
            fontFamily: 'Arial, sans-serif',
            fontSize: 14,
            boxSizing: 'border-box',
            resize: 'none'
          }}
        />
      )}

      {estado && (
        <div
          style={{
            fontSize: 12,
            color: estado.startsWith('Error') ? '#b42318' : '#2e7d32'
          }}
        >
          {estado}
        </div>
      )}
    </div>
  )
}

export default Widget