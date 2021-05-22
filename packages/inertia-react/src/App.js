import PageContext from './PageContext'
import HeadContext from './HeadContext'
import { createElement, useEffect, useState, useMemo } from 'react'
import { createHeadManager, Inertia } from '@inertiajs/inertia'

export default function App({
  children,
  initialPage,
  resolveComponent,
  resolveErrors,
  transformProps,
}) {
  const [current, setCurrent] = useState({
    component: null,
    page: {},
    key: null,
  })

  const headManager = useMemo(() => {
    return createHeadManager(typeof window === 'undefined')
  }, [])

  useEffect(() => {
    Inertia.init({
      initialPage,
      resolveComponent,
      resolveErrors,
      transformProps,
      swapComponent: async ({ component, page, preserveState }) => {
        setCurrent(current => ({
          component,
          page,
          key: preserveState ? current.key : Date.now(),
        }))
      },
    })
  }, [])

  if (!current.component) {
    return createElement(HeadContext.Provider, { value: headManager }, createElement(PageContext.Provider, { value: current.page }, null))
  }

  const renderChildren = children || (({ Component, props, key }) => {
    const child = createElement(Component, { key, ...props })

    if (typeof Component.layout === 'function') {
      return Component.layout(child)
    }

    if (Array.isArray(Component.layout)) {
      return Component.layout
        .concat(child)
        .reverse()
        .reduce((children, Layout) => createElement(Layout, { children, ...props }))
    }

    return child
  })

  return createElement(HeadContext.Provider, { value: headManager }, createElement(PageContext.Provider, { value: current.page }, renderChildren({
    Component: current.component,
    key: current.key,
    props: current.page.props,
  })))
}

App.displayName = 'Inertia'
