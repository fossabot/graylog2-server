/*
 * Copyright (C) 2020 Graylog, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the Server Side Public License, version 1,
 * as published by MongoDB, Inc.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * Server Side Public License for more details.
 *
 * You should have received a copy of the Server Side Public License
 * along with this program. If not, see
 * <http://www.mongodb.com/licensing/server-side-public-license>.
 */
import React from 'react';
import PropTypes from 'prop-types';

import ModalSubmit from 'components/common/ModalSubmit';

import Modal from './Modal';
import BootstrapModalWrapper from './BootstrapModalWrapper';

/**
 * Component that displays a confirmation dialog box that the user can
 * cancel or confirm.
 */
class BootstrapModalConfirm extends React.Component {
  static propTypes = {
    /** Indicates whether the modal should be shown by default or not. */
    showModal: PropTypes.bool,
    /** Title to use in the modal. */
    title: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.element,
    ]).isRequired,
    /** Text to use in the confirmation button. */
    confirmButtonText: PropTypes.string,
    /** Indicates whether the cancel button should be disabled or not. */
    cancelButtonDisabled: PropTypes.bool,
    /** Indicates whether the confirm button should be disabled or not. */
    confirmButtonDisabled: PropTypes.bool,
    /** Function to call when the modal is opened. The function does not receive any arguments. */
    onModalOpen: PropTypes.func,
    /** Function to call when the modal is closed. The function does not receive any arguments. */
    onModalClose: PropTypes.func,
    /** Function to call when the action is not confirmed. The function does not receive any arguments. */
    onCancel: PropTypes.func,
    /**
     * Function to call when the action is confirmed. The function receives a callback function to close the modal
     * dialog box as first argument.
     */
    onConfirm: PropTypes.func.isRequired,
    /**
     * React elements to display in the modal body. This should be the information the user has
     * to confirm in order to proceed with the operation.
     */
    children: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.element,
    ]).isRequired,
  };

  static defaultProps = {
    showModal: false,
    confirmButtonText: 'Confirm',
    cancelButtonDisabled: false,
    confirmButtonDisabled: false,
    onCancel: () => {},
    onModalOpen: () => {},
    onModalClose: () => {},
  };

  onCancel = () => {
    const { onCancel } = this.props;

    onCancel();

    this.close();
  };

  onConfirm = () => {
    const { onConfirm } = this.props;

    onConfirm(this.close);
  };

  // eslint-disable-next-line react/no-unused-class-component-methods
  open = () => {
    this.modal.open();
  };

  close = () => {
    this.modal.close();
  };

  render() {
    const {
      showModal,
      onModalOpen,
      onModalClose,
      title,
      children,
      cancelButtonDisabled,
      confirmButtonDisabled,
      confirmButtonText,
    } = this.props;

    return (
      <BootstrapModalWrapper ref={(c) => { this.modal = c; }}
                             showModal={showModal}
                             onOpen={onModalOpen}
                             onClose={onModalClose}
                             onHide={this.onCancel}
                             role="alertdialog">
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {children}
        </Modal.Body>

        <Modal.Footer>
          <ModalSubmit disabledCancel={cancelButtonDisabled}
                       disabledSubmit={confirmButtonDisabled}
                       onCancel={this.onCancel}
                       onSubmit={this.onConfirm}
                       submitButtonText={confirmButtonText}
                       submitButtonType="button" />
        </Modal.Footer>
      </BootstrapModalWrapper>
    );
  }
}

export default BootstrapModalConfirm;
