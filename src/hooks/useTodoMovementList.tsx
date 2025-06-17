import {useCallback, useRef, useState} from 'react';
import {MovementItem} from '../types/MovementTypes';
import {useSelector} from 'react-redux';
import {OrderResponseModel} from '../models/OrderModel';
import {getMovementList} from '../services/foodService';
import {NavigatorNames} from '../navigators/tabs/NavigatorsNames';
import {navigate} from '../navigators/utils/Utils';
import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import {ProfileData} from '../models/ProfileModel';
import {
  getDoctorOrPatintById,
  isIdInAsyncStorage,
} from '../screens/movements/mocap/MocapConstants';
const useTodoMovementList = (orderId: string, isFromDoctor: boolean) => {
  const todoPage = useRef(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [todoLoading, setTodoLoading] = useState(false);
  const [refreshingTodo, setRefreshingTodo] = useState(false);
  const [movementTodoList, setMovementTodoList] = useState<MovementItem[]>([]);
  const [overDueIndex, setOverDueIndex] = useState(-1);
  const [todoIndex, setTodoIndex] = useState(-1);
  const [pedningIndex, setPendingDueIndex] = useState(-1);
  const savedData = useRef([]);

  const isFocused = useIsFocused();
  const profileData: ProfileData = useSelector(
    (state: any) => state?.profile?.data,
  );
  useFocusEffect(
    useCallback(() => {
      if (isFocused) {
        if (isFromDoctor) {
          fetchMovementList(1);
          todoPage.current = 1;
        } else {
          console.log('useTodoMovementList focus');
          getasyncStorageData();
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );
  // const twoDNames = [
  //   'Posture Front',
  //   'Posture Side',
  //   'Sit to Stand',
  //   '5 Chair Stand',
  //   'Two Minute Step',
  //   // 'Single Leg Balance',
  // ];

  // const filter2DNames = data => {
  //   return data.filter(item =>
  //     twoDNames.some(name => item.name.includes(name)),
  //   );
  // };
  const getasyncStorageData = async () => {
    try {
      const doctorStorageData = await getDoctorOrPatintById(
        profileData.ameyaId,
        false,
      );
      console.log('doctorStorageData', doctorStorageData);
      if (doctorStorageData) {
        savedData.current = doctorStorageData.data;
      } else {
        savedData.current = [];
      }
      fetchMovementList(1);
      todoPage.current = 1;
    } catch (error) {}
  };

  const fetchMovementList = async (pageNum: number) => {
    setTodoLoading(true);
    console.log('fetchMovementList called');
    try {
      //const orderId = orderResponse?.order?.id;
      if (orderId) {
        const response = await getMovementList(
          pageNum,
          10,
          orderId,
          'PENDING',
          isFromDoctor ? {} : {is2D: true},
        );
        console.log('pending list reponse is', response?.data);
        const filterResult2D = response?.data; //isFromDoctor
        // ? response?.data
        // : filter2DNames(response?.data);
        console.log(filterResult2D);
        setHasNextPage(response.hasNextPage);
        const list = await filterResult2D;
        const today = new Date();
        let hasOverdue = false;
        let hasTodo = false;
        let hasPending = false;
        // Process the response and categorize items
        list.forEach((item: MovementItem, index: number) => {
          const itemDate = new Date(item.endDate);
          if (isFromDoctor) {
            if (itemDate < today) {
              if (!hasOverdue) {
                setOverDueIndex(index);
                hasOverdue = true;
              }
            } else {
              if (!hasTodo && hasOverdue) {
                setTodoIndex(index);
                hasTodo = true;
              }
            }
          } else {
            if (itemDate < today) {
              if (!hasOverdue) {
                setOverDueIndex(index);
                hasOverdue = true;
              }
            } else if (
              savedData.current.length > 0 &&
              isIdInAsyncStorage(savedData.current, item.id) === true
            ) {
              if (!hasPending) {
                setPendingDueIndex(index);
                hasPending = true;
              }
            } else {
              if (savedData.current.length === 0) {
                setPendingDueIndex(-1);
                hasPending = false;
              }

              if (!hasTodo && (hasOverdue || hasPending)) {
                setTodoIndex(index);
                hasTodo = true;
              } else {
                if (!(hasOverdue || hasPending)) {
                  setTodoIndex(-1);
                  hasTodo = false;
                }
              }
            }
          }
        });

        if (pageNum === 1) {
          setMovementTodoList(list);
        } else {
          setMovementTodoList(pre => [...pre, ...list]);
        }
      }
    } catch (error) {
    } finally {
      setTodoLoading(false);
      setRefreshingTodo(false);
    }
  };

  const refreshTodoList = async () => {
    setRefreshingTodo(true);
    savedData.current = [];
    await fetchMovementList(1);
    todoPage.current = 1;
  };

  const loadMoreTodoList = async () => {
    if (hasNextPage && !todoLoading) {
      await fetchMovementList(todoPage.current + 1);
      todoPage.current += 1;
    }
  };

  const navigateToTodoScreen = (item: MovementItem) => {};

  return {
    todoPage,
    hasNextPage,
    setHasNextPage,
    todoLoading,
    setTodoLoading,
    refreshingTodo,
    setRefreshingTodo,
    movementTodoList,
    setMovementTodoList,
    refreshTodoList,
    loadMoreTodoList,
    navigateToTodoScreen,
    overDueIndex,
    todoIndex,
    pedningIndex,
  };
};

export default useTodoMovementList;
