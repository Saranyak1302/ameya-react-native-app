#pragma once

#include "constants.h"
#include "extract_poses.h"
#include "optimization_mode.h"

#include <vector>
#include <opencv2/imgproc/imgproc.hpp>

std::vector<cv::Mat> wrap_feature_maps(float* data, int num_channels, int width, int height);

extern "C"
{
	EXPORT float* lightbuzz_update_poses(float* heatmaps, float* pafmaps, const int heat_width, const int heat_height, int upscaling, int heat_channels, int paf_channels, int source_width, int source_height, int dest_width, int dest_height, int top, int bottom, int left, int right, lightbuzz::OptimizationMode optimization_mode, int& data_length, int& num_people);
	EXPORT void lightbuzz_pose_release();
}
