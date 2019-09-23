import React, { Component } from 'react';
import { ActivityIndicator } from 'react-native';
import PropTypes from 'prop-types';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import api from '../../services/api';
import {
  Header,
  Name,
  Bio,
  Avatar,
  Container,
  Stars,
  Starred,
  OwnerAvatar,
  Info,
  Title,
  Author,
} from './styles';

export default class User extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('user').name,
  });

  state = {
    stars: [],
    loading: false,
    currentPage: 1,
    refreshing: false,
  };

  static propTypes = {
    navigation: PropTypes.shape({
      getParam: PropTypes.func,
      navigate: PropTypes.func,
    }).isRequired,
  };

  async componentDidMount() {
    this.setState({ loading: true });
    const stars = await this.loadStarredRepositories();

    this.setState({
      stars,
      loading: false,
    });
  }

  loadMore = async () => {
    this.setState({ loading: true });
    let { currentPage } = this.state;
    currentPage += 1;

    const stars = await this.loadStarredRepositories(currentPage);

    if (stars.length) {
      const { stars: currentStars } = this.state;
      this.setState({
        currentPage,
        stars: [...currentStars, ...stars],
      });
    }

    this.setState({
      loading: false,
    });
  };

  loadStarredRepositories = async (page = 1) => {
    const { navigation } = this.props;

    const user = navigation.getParam('user');

    const response = await api.get(`users/${user.login}/starred`, {
      params: {
        page,
      },
    });
    return response.data;
  };

  refreshList = async () => {
    this.setState({ refreshing: true });

    const stars = await this.loadStarredRepositories();

    this.setState({
      stars,
      refreshing: false,
      currentPage: 1,
    });
  };

  handleNavigate = star => {
    const { navigation } = this.props;
    navigation.navigate('Repository', { star });
  };

  render() {
    const { navigation } = this.props;
    const user = navigation.getParam('user');

    const { stars, loading, refreshing } = this.state;
    return (
      <Container>
        <Header>
          <Avatar source={{ uri: user.avatar }} />
          <Name>{user.name}</Name>
          <Bio>{user.bio}</Bio>
        </Header>
        {stars.length ? (
          <Stars
            onRefresh={this.refreshList}
            refreshing={refreshing}
            onEndReachedThreshold={0.2}
            onEndReached={this.loadMore}
            data={stars}
            keyExtractor={star => String(star.id)}
            renderItem={({ item }) => (
              <TouchableWithoutFeedback
                onPress={() => this.handleNavigate(item)}
              >
                <Starred>
                  <OwnerAvatar source={{ uri: item.owner.avatar_url }} />
                  <Info>
                    <Title>{item.name}</Title>
                    <Author>{item.owner.login}</Author>
                  </Info>
                </Starred>
              </TouchableWithoutFeedback>
            )}
          />
        ) : null}
        {loading ? <ActivityIndicator color="#999" /> : null}
      </Container>
    );
  }
}
