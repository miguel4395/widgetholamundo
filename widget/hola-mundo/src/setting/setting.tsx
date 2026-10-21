import { React, Immutable, AllDataSourceTypes } from 'jimu-core'
import { type AllWidgetSettingProps } from 'jimu-for-builder'
import { DataSourceSelector } from 'jimu-ui/advanced/data-source-selector'

const Setting = (props: AllWidgetSettingProps<{}>) => {
  const onDataSourceChange = (useDataSources: any[]) => {
    props.onSettingChange({
      id: props.id,
      useDataSources: useDataSources
    })
  }

  return (
    <div className="widget-setting-hola-mundo p-3" style={{ padding: '16px' }}>
      <div className="setting-section">
        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
          Seleccionar capa de destino:
        </label>
        <p style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
          Selecciona la capa <strong>Locales Nuevos</strong> perteneciente a <em>Mapa analisis</em>.
        </p>
        <DataSourceSelector
          types={Immutable([AllDataSourceTypes.FeatureLayer])}
          useDataSources={props.useDataSources}
          onChange={onDataSourceChange}
          widgetId={props.id}
          mustUseDataSource={true}
        />
      </div>
    </div>
  )
}

export default Setting

