import * as React from 'react';
import { SceneView, StackActions } from '@react-navigation/core';
import Stack from './Stack';
import {
  DefaultTransition,
  ModalSlideFromBottomIOS,
} from '../TransitionConfigs/TransitionPresets';
import {
  NavigationProp,
  SceneDescriptor,
  NavigationConfig,
  Route,
} from '../types';
import { Platform } from 'react-native';

type Props = {
  navigation: NavigationProp;
  descriptors: { [key: string]: SceneDescriptor };
  navigationConfig: NavigationConfig;
  onTransitionStart?: () => void;
  onGestureBegin?: () => void;
  onGestureCanceled?: () => void;
  onGestureEnd?: () => void;
  screenProps?: unknown;
};

type State = {
  initialRoutes: string[];
  closingRoutes: string[];
};

class StackView extends React.Component<Props, State> {
  state: State = {
    initialRoutes: this.props.navigation.state.routes.map(route => route.key),
    closingRoutes: [],
  };

  private getTitle = ({ route }: { route: Route }) => {
    const descriptor = this.props.descriptors[route.key];
    const { headerTitle, title } = descriptor.options;

    return headerTitle !== undefined ? headerTitle : title;
  };

  private renderScene = ({ route }: { route: Route }) => {
    const { navigation, getComponent } = this.props.descriptors[route.key];
    const SceneComponent = getComponent();

    const { screenProps } = this.props;

    return (
      <SceneView
        screenProps={screenProps}
        navigation={navigation}
        component={SceneComponent}
      />
    );
  };

  private handleGoBack = ({ route }: { route: Route }) =>
    this.setState(state => ({
      closingRoutes: [...state.closingRoutes, route.key],
    }));

  private handleCloseRoute = ({ route }: { route: Route }) => {
    this.props.navigation.dispatch(StackActions.pop({ key: route.key }));
    this.setState(state => ({
      closingRoutes: state.closingRoutes.filter(key => key !== route.key),
      initialRoutes: state.initialRoutes.filter(key => key !== route.key),
    }));
  };

  render() {
    const { navigation, navigationConfig } = this.props;
    const { initialRoutes, closingRoutes } = this.state;

    const TransitionPreset =
      navigationConfig.mode === 'modal' && Platform.OS === 'ios'
        ? ModalSlideFromBottomIOS
        : DefaultTransition;
    const headerMode =
      navigationConfig.headerMode || TransitionPreset.headerMode;

    return (
      <Stack
        {...TransitionPreset}
        headerMode={headerMode}
        navigationState={navigation.state}
        initialRoutes={initialRoutes}
        closingRoutes={closingRoutes}
        onGoBack={this.handleGoBack}
        onCloseRoute={this.handleCloseRoute}
        getTitle={this.getTitle}
        renderScene={this.renderScene}
      />
    );
  }
}

export default StackView;
