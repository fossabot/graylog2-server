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
import moment from 'moment';
import styled from 'styled-components';

import connect from 'stores/connect';
import { MenuItem, ButtonGroup, DropdownButton, Button } from 'components/bootstrap';
import { Icon, Pluralize } from 'components/common';
import { RefreshActions, RefreshStore } from 'views/stores/RefreshStore';

const FlexibleButtonGroup = styled(ButtonGroup)`
  display: flex;

  > .btn-group {
    .btn:first-child {
      max-width: 100%;
    }
  }
`;

const ButtonLabel = ({ refreshConfigEnabled, naturalInterval }: {refreshConfigEnabled: boolean, naturalInterval: React.ReactNode}) => {
  let buttonText: React.ReactNode = 'Not updating';

  if (refreshConfigEnabled) {
    buttonText = <>Every {naturalInterval}</>;
  }

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{buttonText}</>;
};

const _onChange = (interval: number) => {
  RefreshActions.setInterval(interval);
};

type RefreshConfig = {
  interval: number,
  enabled: boolean,
};

type Props = {
  refreshConfig: RefreshConfig,
};

class RefreshControls extends React.Component<Props> {
  static propTypes = {
    refreshConfig: PropTypes.exact({
      interval: PropTypes.number.isRequired,
      enabled: PropTypes.bool.isRequired,
    }).isRequired,
  };

  static INTERVAL_OPTIONS: Array<[string, number]> = [
    ['1 Second', 1000],
    ['2 Seconds', 2000],
    ['5 Seconds', 5000],
    ['10 Seconds', 10000],
    ['30 Seconds', 30000],
    ['1 Minute', 60000],
    ['5 Minutes', 300000],
  ];

  componentWillUnmount(): void {
    RefreshActions.disable();
  }

  _toggleEnable = (): void => {
    const { refreshConfig } = this.props;

    if (refreshConfig.enabled) {
      RefreshActions.disable();
    } else {
      RefreshActions.enable();
    }
  };

  render() {
    const { refreshConfig } = this.props;

    const intervalOptions = RefreshControls.INTERVAL_OPTIONS.map(([label, interval]: [string, number]) => {
      return <MenuItem key={`RefreshControls-${label}`} onClick={() => _onChange(interval)}>{label}</MenuItem>;
    });
    const intervalDuration = moment.duration(refreshConfig.interval);
    const naturalInterval = intervalDuration.asSeconds() < 60
      ? <span>{intervalDuration.asSeconds()} <Pluralize singular="second" plural="seconds" value={intervalDuration.asSeconds()} /></span>
      : <span>{intervalDuration.asMinutes()} <Pluralize singular="minute" plural="minutes" value={intervalDuration.asMinutes()} /></span>;

    return (
      <FlexibleButtonGroup aria-label="Refresh Search Controls">
        <Button onClick={this._toggleEnable}>
          {refreshConfig.enabled ? <Icon name="pause" /> : <Icon name="play" />}
        </Button>

        <DropdownButton title={<ButtonLabel refreshConfigEnabled={refreshConfig.enabled} naturalInterval={naturalInterval} />} id="refresh-options-dropdown">
          {intervalOptions}
        </DropdownButton>
      </FlexibleButtonGroup>
    );
  }
}

export default connect(RefreshControls, { refreshConfig: RefreshStore });
