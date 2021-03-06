import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { View, FlatList, StyleSheet, SafeAreaView } from 'react-native';

import { State } from '../../store';
import { FONT_FAMILY } from '../../assets';
import { Card, LoadingCard, Search, Error } from '../../components';
import { LAZY_LOAD_PLACEHOLDER_COUNT } from '../../constants';

import {
  fetchConnectionsReqAction,
  searchConnectionsReqAction,
} from '../../store/actions/connections';

export const Home = () => {
  const [showSearchResults, setShowSearchResults] = useState(false);

  const {
    connections,
    fetchErrMsg,
    searchErrMsg,
    searchResults,
    fetchingConnections,
    searchingConnections,
  } = useSelector(({ connectionsReducer }: State) => connectionsReducer);

  const dispatch = useDispatch();

  const handleSearch = useCallback(
    (value: string) => {
      setShowSearchResults(true);
      dispatch(searchConnectionsReqAction(value, connections));
    },
    [dispatch, connections],
  );

  const handleConnectionsFetch = useCallback(
    () => dispatch(fetchConnectionsReqAction(50)),
    [dispatch],
  );

  const handleClear = useCallback(() => {
    setShowSearchResults(false);
  }, []);

  useEffect(() => {
    handleConnectionsFetch();
  }, [handleConnectionsFetch]);

  const showListSkeleton = useMemo(() => {
    return searchingConnections || (fetchingConnections && !connections);
  }, [searchingConnections, fetchingConnections, connections]);

  const listData = useMemo(() => {
    if (showSearchResults) {
      return searchResults;
    }

    return connections;
  }, [searchResults, showSearchResults, connections]);

  const error = useMemo(() => {
    if (fetchErrMsg) {
      return {
        label: fetchErrMsg,
        handler: handleConnectionsFetch,
      };
    }

    if (searchErrMsg) {
      return {
        label: searchErrMsg,
      };
    }

    return undefined;
  }, [fetchErrMsg, searchErrMsg, handleConnectionsFetch]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.container, styles.subContainer]}>
        <Search onClear={handleClear} onSubmit={handleSearch} />

        {/* error message if API fails with a prompt to try again*/}
        {error && !showListSkeleton && (
          <Error label={error.label} handler={error.handler} />
        )}

        {/* connection cards list */}
        {listData !== undefined && listData.length !== 0 && !showListSkeleton && (
          <FlatList
            data={listData}
            renderItem={({ item, index }) =>
              index >= listData.length - LAZY_LOAD_PLACEHOLDER_COUNT &&
              index <= listData.length - 1 &&
              !showSearchResults ? (
                // placeholder cards for loading more cards
                // when user reaches end of the list
                <LoadingCard />
              ) : (
                <Card
                  name={item.name}
                  cell={item.cell}
                  email={item.email}
                  location={item.location}
                  thumbnail={item.thumbnail}
                />
              )
            }
            onEndReachedThreshold={1}
            keyExtractor={({ email }) => email}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            onEndReached={handleConnectionsFetch}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}

        {/* initial loading skeleton */}
        {showListSkeleton && (
          <FlatList
            keyExtractor={(item) => item}
            contentContainerStyle={styles.list}
            renderItem={() => <LoadingCard />}
            showsVerticalScrollIndicator={false}
            data={[...Array(10).keys()].map((i: number) => String(i))}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  subContainer: {
    paddingTop: 20,
  },
  separator: {
    height: 20,
  },
  list: {
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  regularFont: {
    fontFamily: FONT_FAMILY.MontserratRegular,
  },
});
