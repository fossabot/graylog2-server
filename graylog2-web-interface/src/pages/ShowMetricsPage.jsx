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
// eslint-disable-next-line no-restricted-imports
import createReactClass from 'create-react-class';
import Reflux from 'reflux';

import { DocumentTitle, PageHeader, Spinner } from 'components/common';
import { MetricsComponent } from 'components/metrics';
import withParams from 'routing/withParams';
import withLocation from 'routing/withLocation';
import { MetricsActions, MetricsStore } from 'stores/metrics/MetricsStore';
import { NodesStore } from 'stores/nodes/NodesStore';

const ShowMetricsPage = createReactClass({
  // eslint-disable-next-line react/no-unused-class-component-methods
  displayName: 'ShowMetricsPage',

  // eslint-disable-next-line react/no-unused-class-component-methods
  propTypes: {
    location: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired,
  },

  mixins: [Reflux.connect(NodesStore), Reflux.connect(MetricsStore), Reflux.listenTo(NodesStore, '_getMetrics')],

  // eslint-disable-next-line react/no-unused-class-component-methods
  _getMetrics() {
    MetricsActions.names();
  },

  render() {
    if (!this.state.nodes || !this.state.metricsNames) {
      return <Spinner />;
    }

    let { nodeId } = this.props.params;

    // "leader" node ID is a placeholder for leader node, get first leader node ID
    if (nodeId === 'leader' || nodeId === 'master') { // `master` is deprecated but we still support it here
      const nodeIDs = Object.keys(this.state.nodes);
      const leaderNodes = nodeIDs.filter((nodeID) => this.state.nodes[nodeID].is_leader);

      nodeId = leaderNodes[0] || nodeIDs[0];
    }

    const { metricsNames, metricsErrors } = this.state;

    const node = this.state.nodes[nodeId];
    const title = <span>Metrics of node {node.short_node_id} / {node.hostname}</span>;
    const { namespace } = MetricsStore;
    const names = metricsNames[nodeId];
    const error = metricsErrors ? metricsErrors[nodeId] : undefined;
    const { filter } = this.props.location.query;

    return (
      <DocumentTitle title={`Metrics of node ${node.short_node_id} / ${node.hostname}`}>
        <span>
          <PageHeader title={title}>
            <span>
              All Graylog nodes provide a set of internal metrics for diagnosis, debugging and monitoring. Note that you can access
              all metrics via JMX, too.<br />
              This node is reporting a total of {(names || []).length} metrics.
            </span>
          </PageHeader>

          <MetricsComponent names={names} namespace={namespace} nodeId={nodeId} filter={filter} error={error} />
        </span>
      </DocumentTitle>
    );
  },
});

export default withParams(withLocation(ShowMetricsPage));
