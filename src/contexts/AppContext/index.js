import React, {Component} from 'react';
import axios from 'axios';

import {BASE_API_URL} from '../../constants/endpoints';

import {TYPES} from '../../constants/merchTypes';

export const AppContext = React.createContext(true);

class AppProvider extends Component {

  state = {
    isAppLoaded: false,
    rivals: [],
    matches: [],
    merch: [],
    orders: [],
    notifications: null,
    statistics: null,
  };

  componentDidMount() {
    if (localStorage.getItem('isAuth')) {
      this.loadAppData();
    }
  }

  loadAppData = () => {
    const {fetchMatches, fetchRivals, fetchMerch, fetchOrders, fetchStatistics} = this;
    Promise.all([fetchMatches(), fetchRivals(), fetchMerch(), fetchOrders(), fetchStatistics()])
      .then(([matches, rivals, merch, orders, statistics]) => this.setState({
        matches,
        rivals,
        merch,
        orders,
        statistics
      }))
      .finally(() => this.setState({isAppLoaded: true}))
  };

  fetchRivals = async () => {
    const rivals = await axios.get(`${BASE_API_URL}/rival`);
    return rivals.data;
  };

  fetchMatches = async () => {
    const matches = await axios.get(`${BASE_API_URL}/match`);
    return matches.data;
  };

  fetchMerch = async () => {
    const rivals = await axios.get(`${BASE_API_URL}/merch`);
    return rivals.data;
  };

  fetchOrders = async () => {
    const orders = await axios.get(`${BASE_API_URL}/order`);
    return orders.data;
  };

  fetchStatistics = async () => {
    const statistics = await axios.get(`${BASE_API_URL}/statistics`);
    return statistics.data;
  };

  createRival = (id, name, logo, cb) => {
    axios
      .post(`${BASE_API_URL}/rival/create`, {id, name, logo})
      .then(({data}) => this.setState(prevState => {
        return {rivals: [data, ...prevState.rivals]}
      }))
      .catch(err => console.log(err))
      .finally(() => cb && cb());
  };

  updateRival = (id, name, logo, cb) => {
    axios
      .post(`${BASE_API_URL}/rival/${id}/update`, {name, logo})
      .then(({data}) => this.setState(({rivals}) => {
        return {rivals: rivals.map(rival => rival.id === data.id ? data : rival)}
      }))
      .catch(err => console.log(err))
      .finally(() => cb && cb());
  };

  updateMerch = (id, name, image, price, description, type, count, cb = null) => {
    axios
      .post(`${BASE_API_URL}/merch/${id}/update`, {name, image, price, description, type, count})
      .then(({data}) => this.setState(({merch}) => {
        return {merch: merch.map(item => item.id === data.id ? data : item)}
      }))
      .catch(err => console.log(err))
      .finally(() => cb && cb());
  };

  createMatch = (id, rivalId, place, startDateTime, buyTicketsUrl, isPlayOff, cb = null) => {
    axios
      .post(`${BASE_API_URL}/match/create`, {id, rivalId, place, startDateTime, buyTicketsUrl, isPlayOff})
      .then(({data}) => this.setState(prevState => {
        return {matches: [data, ...prevState.matches]}
      }))
      .catch(err => console.log(err))
      .finally(() => cb && cb());
  };

  createMerch = (id, name, image, price, description, type, values, count, cb = null) => {
    const data = {id, name, image, price, description, type, count};
    axios
      .post(`${BASE_API_URL}/merch/create`, data)
      .then(({data}) => this.setState(prevState => {
          return {merch: [data, ...prevState.merch]}
        }, () => type === TYPES.DIGITAL ?
        this.createDigitalMerchValues(id, values, cb) : (!!cb && cb())
      ))
      .catch(err => console.log(err));
  };

  createDigitalMerchValues = (id, values, cb = null) => {
    const items = values.map(item => {
      return {
        merchId: id,
        orderId: 'null',
        value: item,
      }
    });
    axios
      .post(`${BASE_API_URL}/digital`, {items})
      .finally(() => !!cb && cb())
  };

  deleteMatch = (id) => {
    axios
      .post(`${BASE_API_URL}/match/${id}/delete`)
      .then(() => this.setState(({matches}) => {
        return {
          matches: matches.filter(item => item.id !== id)
        }
      }))
  };

  deleteRival = (id) => {
    axios
      .post(`${BASE_API_URL}/rival/${id}/delete`)
      .then(() => this.setState(({rivals}) => {
        return {
          rivals: rivals.filter(item => item.id !== id)
        }
      }))
  };

  deleteMerch = (id) => {
    axios
      .post(`${BASE_API_URL}/merch/${id}/delete`)
      .then(() => this.setState(({merch}) => {
        return {
          merch: merch.filter(item => item.id !== id)
        }
      }))
  };

  setMatchResults = (id, firstFive, score, twoScore, threeScore, tossing, cb) => {
    axios
      .post(`${BASE_API_URL}/match/${id}/setresult`, {firstFive, score, twoScore, threeScore, tossing: !!tossing})
      .then(({data}) => this.setState(prevState => {
        let matches = prevState.matches;
        const foundIndex = matches.findIndex(match => match.id === id);
        matches[foundIndex] = data;
        return {matches}
      }))
      .catch(err => console.log(err))
      .finally(() => cb && cb());
  };

  changeOrderStatus = (id, status, cb) => {
    axios
      .post(`${BASE_API_URL}/order/${id}/update`, {status})
      .then(({data}) => {
        this.setState(prevState => {
          return {
            orders: prevState.orders.map(item => item.id === data.id ? data : item)
          }
        }, () => cb && cb());
      })
      .catch(err => console.log(err));
  };

  fetchNotifications = async () => {
    const notifications = await axios.get(`${BASE_API_URL}/notification`);
    this.setState({notifications: notifications.data});
  };

  createNotification = message => {
    axios
      .post(`${BASE_API_URL}/notification`, {message})
      .then(response => this.setState(prevState => {
        return {
          notifications: [response.data.notificationData, ...prevState.notifications]
        }
      }))
      .catch(error => console.log(error))
  };

  render() {
    return (
      <AppContext.Provider
        value={{
          state: this.state,

          createRival: this.createRival,
          createMatch: this.createMatch,
          createMerch: this.createMerch,

          updateRival: this.updateRival,
          updateMerch: this.updateMerch,

          deleteMerch: this.deleteMerch,
          deleteMatch: this.deleteMatch,
          deleteRival: this.deleteRival,

          setMatchResults: this.setMatchResults,
          changeOrderStatus: this.changeOrderStatus,

          fetchNotifications: this.fetchNotifications,
          createNotification: this.createNotification,
        }}
      >
        {this.props.children}
      </AppContext.Provider>
    );
  }
}

export function withAppContext(Component) {
  return function WrapperComponent(props) {
    return (
      <AppContext.Consumer>
        {state => <Component {...props} context={state}/>}
      </AppContext.Consumer>
    );
  };
}

export default AppProvider;
