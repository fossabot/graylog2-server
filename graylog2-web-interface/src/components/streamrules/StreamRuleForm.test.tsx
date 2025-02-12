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
import * as React from 'react';
import { cleanup, render, fireEvent } from 'wrappedTestingLibrary';

import { MockStore } from 'helpers/mocking';

import StreamRuleForm from './StreamRuleForm';

jest.mock('components/common', () => ({
  TypeAheadFieldInput: ({ defaultValue }: { defaultValue: React.ReactNode }) => (<div>{defaultValue}</div>),
  Icon: ({ children }: { children: React.ReactNode }) => (<div>{children}</div>),
}));

jest.mock('stores/inputs/InputsStore', () => ({
  InputsActions: {
    list: jest.fn(),
  },
  InputsStore: MockStore(['getInitialState', () => ({ inputs: [] })]),
}));

describe('StreamRuleForm', () => {
  const streamRuleTypes = [
    { id: 1, short_desc: 'match exactly', long_desc: 'match exactly', name: 'Stream rule match exactly' },
    { id: 2, short_desc: 'match regular expression', long_desc: 'match regular expression', name: 'Stream rule match regular' },
    { id: 3, short_desc: 'greater than', long_desc: 'greater than', name: 'Stream rule greater than' },
    { id: 4, short_desc: 'smaller than', long_desc: 'smaller than', name: 'Stream rule smaller than' },
    { id: 5, short_desc: 'field presence', long_desc: 'field presence', name: 'Stream rule field presence' },
    { id: 6, short_desc: 'contain', long_desc: 'contain', name: 'Stream rule contain' },
    { id: 7, short_desc: 'always match', long_desc: 'always match', name: 'Stream rule always match' },
    { id: 8, short_desc: 'match input', long_desc: 'match input', name: 'Stream rule match input' },
  ];

  const SUT = (props: Partial<React.ComponentProps<typeof StreamRuleForm>>) => (
    <StreamRuleForm onSubmit={() => {}}
                    streamRuleTypes={streamRuleTypes}
                    submitButtonText="Update rule"
                    submitLoadingText="Updating rule..."
                    title="Bach"
                    {...props} />
  );

  afterEach(() => {
    cleanup();
  });

  const getStreamRule = (type = 1) => {
    return {
      id: 'dead-beef',
      type,
      field: 'field_1',
      value: 'value_1',
      inverted: false,
      description: 'description',
    };
  };

  it('should render an empty StreamRuleForm', () => {
    const container = render(<SUT />);

    expect(container).not.toBeNull();
  });

  it('should render an simple StreamRuleForm', () => {
    const container = render(<SUT streamRule={getStreamRule()} />);

    expect(container).not.toBeNull();
  });

  it('should validate the selection of match input', () => {
    const submit = jest.fn();
    const inputs = [
      { id: 'my-id', title: 'title', name: 'name' },
    ];
    const { getByTestId, getByText } = render(
      <SUT onSubmit={submit}
           streamRule={getStreamRule()}
           inputs={inputs} />,
    );

    const ruleTypeSelection = getByTestId('rule-type-selection');
    fireEvent.change(ruleTypeSelection, { target: { name: 'type', value: 8 } });
    const submitBtn = getByText('Update rule');
    fireEvent.click(submitBtn);

    expect(submit).toHaveBeenCalledTimes(0);

    const inputSelection = getByTestId('input-selection');
    fireEvent.change(inputSelection, { target: { name: 'value', value: 'my-id' } });
    fireEvent.click(submitBtn);

    expect(submit).toHaveBeenCalledTimes(1);
  });
});
