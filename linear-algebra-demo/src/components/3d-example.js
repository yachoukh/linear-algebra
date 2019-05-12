import React from 'react'
import styled, { withTheme } from 'styled-components'
import * as THREE from 'three'
import OrbitControls from 'three-orbitcontrols'
import { withSize } from 'react-sizeme'

import {
  getGetAnimatedColor,
  getGetAnimatedTransformation
} from '../utils/animations'
import { toMatrix4, fromMatrix4 } from '../utils/three'
import Container from './example-container'
import InfoContainer from './info-container'

const View = styled.div`
  width: 100%;
  height: 100%;
`

const PERIOD = 5000

class ThreeScene extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      width: 0,
      height: 0
    }
  }

  render() {
    return <View ref={el => (this.view = el)} />
  }

  componentDidMount() {
    const {
      size: { width, height },
      matrix,
      theme
    } = this.props
    this.setState({ width, height })
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(100, width / height)
    this.camera.position.set(1, 1, 4)

    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setClearColor(theme.color.background)
    this.renderer.setSize(width, height)
    this.view.appendChild(this.renderer.domElement)

    const initialColor = theme.color.red
    const axes = new THREE.AxesHelper(4)
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    this.segments = new THREE.LineSegments(
      new THREE.EdgesGeometry(geometry),
      new THREE.LineBasicMaterial({ color: theme.color.mainText })
    )
    this.cube = new THREE.Mesh(
      geometry,
      new THREE.MeshBasicMaterial({ color: initialColor })
    )
    this.objects = [this.cube, this.segments]
    this.objects.forEach(obj => (obj.matrixAutoUpdate = false))
    this.scene.add(this.cube, axes, this.segments)

    this.controls = new OrbitControls(this.camera)

    this.getAnimatedColor = getGetAnimatedColor(
      initialColor,
      theme.color.blue,
      PERIOD
    )
    const fromMatrix = fromMatrix4(this.cube.matrix)
    const toMatrix = matrix.toDimension(4)
    this.getAnimatedTransformation = getGetAnimatedTransformation(
      fromMatrix,
      toMatrix,
      PERIOD
    )
    this.frameId = requestAnimationFrame(this.animate)
  }

  componentWillUnmount() {
    cancelAnimationFrame(this.frameId)
    this.view.removeChild(this.renderer.domElement)
  }

  animate = () => {
    const transformation = this.getAnimatedTransformation()
    const matrix4 = toMatrix4(transformation)
    this.cube.material.color.set(this.getAnimatedColor())
    this.objects.forEach(obj => obj.matrix.set(...matrix4.toArray()))
    this.renderer.render(this.scene, this.camera)
    this.frameId = window.requestAnimationFrame(this.animate)
  }

  componentWillReceiveProps({ size: { width, height } }) {
    if (this.state.width !== width || this.state.height !== height) {
      this.setState({ width, height })
      this.renderer.setSize(width, height)
      this.camera.aspect = width / height
      this.camera.updateProjectionMatrix()
    }
  }
}

const WrappedScene = withTheme(withSize({ monitorHeight: true })(ThreeScene))

const Example3D = ({ matrix, renderInformation, theme }) => {
  const Information = () => {
    if (renderInformation) {
      return renderInformation({ transformedColor: theme.color.blue })
    }
    return null
  }
  return (
    <Container>
      <WrappedScene matrix={matrix} />
      <InfoContainer>
        <Information />
      </InfoContainer>
    </Container>
  )
}

export default withTheme(Example3D)