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
import PropTypes from 'prop-types';
import React from 'react';
import styled, { css } from 'styled-components';

import EntityShareModal from 'components/permissions/EntityShareModal';
import { Link, LinkContainer } from 'components/common/router';
import { Button, Tooltip, ButtonToolbar } from 'components/bootstrap';
import { Icon, OverlayElement, ShareButton } from 'components/common';
import StreamRuleForm from 'components/streamrules/StreamRuleForm';
import { isAnyPermitted, isPermitted } from 'util/PermissionsMixin';
import UserNotification from 'util/UserNotification';
import Routes from 'routing/Routes';
import StreamsStore from 'stores/streams/StreamsStore';
import { StreamRulesStore } from 'stores/streams/StreamRulesStore';
import ObjectUtils from 'util/ObjectUtils';

import StreamMetaData from './StreamMetaData';
import StreamControls from './StreamControls';
import StreamStateBadge from './StreamStateBadge';

const StreamListItem = styled.li(({ theme }) => css`
  display: block;
  padding: 15px 0;

  &:not(:last-child) {
    border-bottom: 1px solid ${theme.colors.gray[90]};
  }

  .stream-data {
    margin-top: 8px;
  }

  .stream-description {
    margin-bottom: 3px;

    .fa-cube {
      margin-right: 5px;
    }
  }
  
  .overlay-trigger {
    float: left;
    margin-left: 5px;
  }
`);

const StreamTitle = styled.h2(({ theme }) => `
  font-family: ${theme.fonts.family.body};
`);

const ToggleButton = styled(Button)`
  min-width: 8.8em;
`;

const _onDelete = (stream) => {
  // eslint-disable-next-line no-alert
  if (window.confirm('Do you really want to remove this stream?')) {
    StreamsStore.remove(stream.id, (response) => {
      UserNotification.success(`Stream '${stream.title}' was deleted successfully.`, 'Success');

      return response;
    });
  }
};

const _onUpdate = (streamId, _stream) => {
  const stream = ObjectUtils.trimObjectFields(_stream, ['title']);

  StreamsStore.update(streamId, stream, (response) => {
    UserNotification.success(`Stream '${stream.title}' was updated successfully.`, 'Success');

    return response;
  });
};

const _onClone = (streamId, _stream) => {
  const stream = ObjectUtils.trimObjectFields(_stream, ['title']);

  StreamsStore.cloneStream(streamId, stream, (response) => {
    UserNotification.success(`Stream was successfully cloned as '${stream.title}'.`, 'Success');

    return response;
  });
};

class Stream extends React.Component {
  static propTypes = {
    stream: PropTypes.object.isRequired,
    permissions: PropTypes.arrayOf(PropTypes.string).isRequired,
    streamRuleTypes: PropTypes.array.isRequired,
    user: PropTypes.object.isRequired,
    indexSets: PropTypes.array.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      showStreamRuleForm: false,
      showEntityShareModal: false,
    };
  }

  _closeStreamRuleForm = () => {
    this.setState({ showStreamRuleForm: false });
  };

  _openStreamRuleForm = () => {
    this.setState({ showStreamRuleForm: true });
  };

  _closeEntityShareModal = () => {
    this.setState({ showEntityShareModal: false });
  };

  _openEntityShareModal = () => {
    this.setState({ showEntityShareModal: true });
  };

  _onResume = () => {
    const { stream } = this.props;

    this.setState({ loading: true });

    StreamsStore.resume(stream.id, (response) => response)
      .finally(() => this.setState({ loading: false }));
  };

  _onPause = () => {
    const { stream } = this.props;

    // eslint-disable-next-line no-alert
    if (window.confirm(`Do you really want to pause stream '${stream.title}'?`)) {
      this.setState({ loading: true });

      StreamsStore.pause(stream.id, (response) => response)
        .finally(() => this.setState({ loading: false }));
    }
  };

  _onSaveStreamRule = (streamRuleId, streamRule) => {
    const { stream } = this.props;

    StreamRulesStore.create(stream.id, streamRule, () => UserNotification.success('Stream rule was created successfully.', 'Success'));
  };

  render() {
    const { indexSets, stream, permissions, streamRuleTypes, user } = this.props;
    const { loading, showStreamRuleForm, showEntityShareModal } = this.state;

    const isDefaultStream = stream.is_default;
    const isNotEditable = !stream.is_editable;
    const defaultStreamTooltip = isDefaultStream
      ? <Tooltip id="default-stream-tooltip">Action not available for the default stream</Tooltip> : null;

    let editRulesLink;

    if (isPermitted(permissions, [`streams:edit:${stream.id}`])) {
      editRulesLink = (
        <OverlayElement overlay={defaultStreamTooltip} placement="top" useOverlay={isDefaultStream} className="overlay-trigger">
          <LinkContainer disabled={isDefaultStream || isNotEditable} to={Routes.stream_edit(stream.id)}>
            <Button>
              <Icon name="stream" /> Manage Rules
            </Button>
          </LinkContainer>
        </OverlayElement>
      );
    }

    let toggleStreamLink;

    if (isAnyPermitted(permissions, [`streams:changestate:${stream.id}`, `streams:edit:${stream.id}`])) {
      if (stream.disabled) {
        toggleStreamLink = (
          <OverlayElement overlay={defaultStreamTooltip} placement="top" useOverlay={isDefaultStream} className="overlay-trigger">
            <ToggleButton bsStyle="success"
                          onClick={this._onResume}
                          disabled={isDefaultStream || loading || isNotEditable}>
              <Icon name="play" /> {loading ? 'Starting...' : 'Start Stream'}
            </ToggleButton>
          </OverlayElement>
        );
      } else {
        toggleStreamLink = (
          <OverlayElement overlay={defaultStreamTooltip} placement="top" useOverlay={isDefaultStream} className="overlay-trigger">
            <ToggleButton bsStyle="primary"
                          onClick={this._onPause}
                          disabled={loading || isNotEditable}>
              <Icon name="pause" /> {loading ? 'Pausing...' : 'Pause Stream'}
            </ToggleButton>
          </OverlayElement>
        );
      }
    }

    const createdFromContentPack = (stream.content_pack
      ? <Icon name="cube" title="Created from content pack" /> : null);

    const streamControls = (
      <OverlayElement overlay={defaultStreamTooltip} placement="top" className="overlay-trigger">
        <StreamControls stream={stream}
                        permissions={permissions}
                        user={user}
                        onDelete={_onDelete}
                        onUpdate={_onUpdate}
                        onClone={_onClone}
                        onQuickAdd={this._openStreamRuleForm}
                        indexSets={indexSets}
                        isDefaultStream={isDefaultStream}
                        disabled={isNotEditable} />
      </OverlayElement>
    );

    const indexSet = indexSets.find((is) => is.id === stream.index_set_id) || indexSets.find((is) => is.is_default);
    const indexSetDetails = isPermitted(permissions, ['indexsets:read']) && indexSet ? <span>index set <em>{indexSet.title}</em> &nbsp;</span> : null;

    return (
      <StreamListItem>
        <ButtonToolbar className="pull-right">
          {toggleStreamLink}{' '}
          {editRulesLink}{' '}
          <ShareButton entityId={stream.id} entityType="stream" onClick={this._openEntityShareModal} />
          {streamControls}
        </ButtonToolbar>

        <StreamTitle>
          <Link to={Routes.stream_search(stream.id)}>{stream.title}</Link>
          {' '}
          <small>{indexSetDetails}<StreamStateBadge stream={stream} /></small>
        </StreamTitle>

        <div className="stream-data">
          <div className="stream-description">
            {createdFromContentPack}

            {stream.description}
          </div>
          <StreamMetaData stream={stream}
                          streamRuleTypes={streamRuleTypes}
                          permissions={permissions}
                          isDefaultStream={isDefaultStream} />
        </div>
        {showStreamRuleForm && (
          <StreamRuleForm onClose={this._closeStreamRuleForm}
                          title="New Stream Rule"
                          submitButtonText="Create Rule"
                          submitLoadingText="Creating Rule..."
                          onSubmit={this._onSaveStreamRule}
                          streamRuleTypes={streamRuleTypes} />
        )}
        {showEntityShareModal && (
          <EntityShareModal entityId={stream.id}
                            entityType="stream"
                            entityTitle={stream.title}
                            description="Search for a User or Team to add as collaborator on this stream."
                            onClose={this._closeEntityShareModal} />
        )}
      </StreamListItem>
    );
  }
}

export default Stream;
