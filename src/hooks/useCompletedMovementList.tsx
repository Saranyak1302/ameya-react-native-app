import {useCallback, useRef, useState} from 'react';
import {MovementItem} from '../types/MovementTypes';
import {useSelector} from 'react-redux';
import {OrderResponseModel} from '../models/OrderModel';
import {getMovementList} from '../services/foodService';
import {useIsFocused, useFocusEffect} from '@react-navigation/native';

const useCompletedMovementList = (orderId: string, isFromDoctor: boolean) => {
  const completePage = useRef(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [completeLoading, setCompleteLoading] = useState(false);
  const [refreshingComplete, setRefreshingComplete] = useState(false);
  const [movementCompletedList, setMovementCompletedList] = useState<
    MovementItem[]
  >([]);
  const [cTotalCount, setTotalCount] = useState(0);

  const isFocused = useIsFocused();

  useFocusEffect(
    useCallback(() => {
      if (isFocused) {
        fetchMovementList(1);
        completePage.current = 1;
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const fetchMovementList = async (pageNum: number) => {
    setCompleteLoading(true);
    try {
      //const orderId = orderResponse?.order?.id;
      if (orderId) {
        const response = await getMovementList(
          pageNum,
          10,
          orderId,
          'COMPLETED',
          isFromDoctor ? {} : {is2D: true},
        );
        setHasNextPage(response.hasNextPage);
        setTotalCount(response?.total ?? 0);
        const list = await response?.data;
        if (pageNum === 1) {
          setMovementCompletedList(list);
        } else {
          setMovementCompletedList(pre => [...pre, ...list]);
        }
      }
    } catch (error) {
    } finally {
      setCompleteLoading(false);
      setRefreshingComplete(false);
    }
  };

  const refreshCompletedList = async () => {
    setRefreshingComplete(true);
    await fetchMovementList(1);
    completePage.current = 1;
  };

  const loadMoreCompletedList = async () => {
    if (hasNextPage && !completeLoading) {
      await fetchMovementList(completePage.current + 1);
      completePage.current += 1;
    }
  };

  const navigateToCompleteScreen = (item: MovementItem) => {};

  return {
    completePage,
    hasNextPage,
    setHasNextPage,
    completeLoading,
    setCompleteLoading,
    refreshingComplete,
    setRefreshingComplete,
    movementCompletedList,
    setMovementCompletedList,
    refreshCompletedList,
    loadMoreCompletedList,
    navigateToCompleteScreen,
    cTotalCount,
  };
};

export default useCompletedMovementList;
