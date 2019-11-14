import React from 'react';
import {Table, Button, Modal, Input, Select} from 'antd';

import {withAppContext} from '../../contexts/AppContext';

import createTranslitId from '../../utils/createTranslitId';

import './Merch.scss';

const TYPES = {
  DIGITAL: 'DIGITAL',
  PHYSICAL: 'PHYSICAL',
};

class Merch extends React.Component {

  state = {
    isModalVisible: false,
    editingMerchId: false,
    name: '',
    image: '',
    price: '',
    description: '',
    type: '',
  };

  columns = () => {
    const {deleteMerch} = this.props.context;
    const {merch} = this.props.context.state;
    return [
      {
        title: 'Название',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: 'Изображение',
        dataIndex: 'image',
        key: 'image',
        render: image => <img src={image} alt={image} width={70}/>
      },
      {
        title: 'Тип',
        dataIndex: 'type',
        key: 'type',
        render: type => type.toUpperCase() === TYPES.DIGITAL ? 'Цифровой' : 'Физический'
      },
      {
        title: 'Описание',
        dataIndex: 'description',
        key: 'description',
      },
      {
        title: 'Цена',
        dataIndex: 'price',
        key: 'price',
      },
      {
        title: 'Действия',
        render: (text, record) => <>
          <Button
            style={{marginRight: 15}}
            onClick={() => this.setState({
              editingMerchId: record.id,
              isModalVisible: true,
              name: merch.find(item => item.id === record.id).name,
              image: merch.find(item => item.id === record.id).image,
            })}
          >
            Редактировать
          </Button>
          <Button
            type='danger'
            style={{marginRight: 15}}
            onClick={() => deleteMerch(record.id)}
          >
            Удалить
          </Button>
        </>
      }
    ]
  };

  onModalClose = () => {
    this.setState({
      isModalVisible: false,
      editingMerchId: null,
      name: '',
      image: '',
      price: '',
      description: '',
      type: TYPES.PHYSICAL,
    })
  };

  handleModalOk = () => {
    const {state, props, onModalClose} = this;
    const {name, image, editingMerchId} = state;
    const {createMerch, editMerch} = props.context;
    const action = editingMerchId ? editMerch : createMerch;
    action(editingMerchId || createTranslitId(name), name, image, onModalClose)
  };

  render() {
    const {isModalVisible, editingMerchId, name, image, description, type, price} = this.state;
    const {merch, isAppLoaded} = this.props.context.state;
    return (
      <div className='merch'>
        <Table
          dataSource={merch}
          columns={this.columns()}
          rowKey={record => record.id}
          loading={!isAppLoaded}
        />
        <Button
          type='primary'
          onClick={() => this.setState({isModalVisible: true})}
          style={{marginTop: 15}}
        >
          Добавить
        </Button>
        <Modal
          title={editingMerchId ? 'Добавить товар' : 'Редактировать'}
          visible={isModalVisible}
          onOk={this.handleModalOk}
          onCancel={this.onModalClose}
        >
          <Input
            placeholder='Название'
            defaultValue={name}
            onChange={e => this.setState({name: e.target.value})}
            style={{marginBottom: 15}}
          />
          <Input
            placeholder='Изображение'
            defaultValue={image}
            onChange={e => this.setState({image: e.target.value})}
            style={{marginBottom: 15}}
          />
          <Input
            placeholder='Цена'
            defaultValue={price}
            onChange={e => this.setState({price: e.target.value})}
            style={{marginBottom: 15}}
          />
          <Input.TextArea
            placeholder='Описание'
            defaultValue={description}
            onChange={e => this.setState({description: e.target.value})}
            style={{marginBottom: 15}}
          />
          <Select
            placeholder='Тип товара'
            defaultValue={type}
            onChange={type => this.setState({type})}
            style={{marginBottom: 15, width: '100%'}}
          >
            <Select.Option value={TYPES.DIGITAL}>Цифровой</Select.Option>
            <Select.Option value={TYPES.PHYSICAL}>Физический</Select.Option>
          </Select>
        </Modal>
      </div>
    )
  }
}

export default withAppContext(Merch);