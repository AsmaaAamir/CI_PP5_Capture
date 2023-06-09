import React, { useState, useEffect } from "react";
import { Col, Row, Container, Button, Image, } from "react-bootstrap";
import { useParams } from "react-router";
import { InfiniteScroll } from "react-InfiniteScroll-components"

import Asset from "../../components.Asset";
import PopularProfiles from "./PopularProfiles";
import { useCurrentUser } from "../../contexts/CurrentUserContext";
import { axiosReq } from "../../api/axiosDefaults";
import { useProfileData, useSetProfileData, } from "../../contexts/ProfileDataContext";
import Post from "../../posts/post";
import { fetchMoreData } from "../../utils/utils";
import { ProfileEditDropdown } from "../../components/MoreDropdown";
import styles from "../../styles/ProfilePage.module.css";


function ProfilePage() {
    const [hasLoaded, setHasLoaded] = useState(false);
    const [profilePosts, setProfilePosts] = useState ({ results : []});
    const useCurrentUser = useCurrentUser();
    const { id } = useParams();
    const { setProfileData, handleFollow, handleUnfollow } = useSetProfileData();
    const { pageProfile } = useProfileData();
    const [profile] = pageProfile.results;
    const is_owner = currentUser?.username === profile?.owner;
    
    /* submits a request to an API to retrieve user
     profiles and posts update profiles page data */

    useEffect(() => {
        const fetchData = async () =>{
            try {
                const [{ data: pageProfile}, { data: profilePosts}] = 
                await Promise.all([
                    axiosReq.get('/profile/${id}/'),
                    axiosReq.get('/posts/?owner_profile=${id}'),
                ]);
                setProfileData((prevState) => ({
                    ...prevState,
                    pageProfile: {result: [pageProfile] },
                }));
                setProfilePosts(profilePosts);
                setHasLoaded(true);
            } catch (err) {
              // console.log(err);
            }
        }; fetchData();
    }, [id, setProfileData]);
    
    /*  User Profile Information Display */
    const mainProfile = (
        <>
            {profile?.is_owner && <ProfileEditDropdown id={profile?.id} />}
            <Row noGutter className="px-3 text-center">
                <Col lg={3} className="text-lg-left">
                    <Image className={styles.ProfileImage} roundedCircle src={profile?.image} />
                </Col>
                <Col lg={6}>
                    <h3 className="m-2">{profile?.owner}</h3>
                    <Row className="justify-content-center no-gutters">
                        <Col xs={3} className="my-2">
                            <div>{profile?.posts_count}</div>
                            <div>Posts</div>
                        </Col>
                        <Col xs={3} className="my-2">
                            <div>{profile?.followers_count}</div>
                            <div>Followers</div>
                        </Col>
                        <Col xs={3} className="my-2">
                            <div>{profile?.following_count}</div>
                            <div>Following</div>
                        </Col>
                    </Row>
                </Col>
                <Col lg={3} className="text-lg-right">
                    {currentUser && !is_owner && (
                        profile?.following_id ? (
                            <Button className={'${styles.Button} ${styles.BlackOutLine}'}
                                onClick={()=> handleUnfollow(Profile)} >
                                    Unfollow 
                            </Button>
                        ) : (
                            <Button className={'${styles.Button} ${styles.BlackOutLine}'}
                            onClick={()=> handleFollow(profile)} >
                                Follow 
                        </Button>
                        ))}
                    </Col>
                    {profile?.content && <Col className="p-3">{profile.content}</Col>}
                </Row>
        </>
        );
    
    /* displaying users posts from the user */
    
    const mainProfilePosts = (
        <>
            <hr/> 
            <p className="text-center">{profile?.owner}'s posts </p>
            <hr/>
            {profilePosts.results.length ? (
                <InfiniteScroll children={profilePosts.results.map((post) => (
                    <Post key={post.id} {...post} setPosts={setProfilePosts} />
                ))}
                dataLength={profilePosts.results.length}
                loader={<Asset spinner />}
                hasMore={!!profilePosts.next}
                next={() => fetchMoreData(profilePosts, setProfilePosts)}
                />
            ) : (
                <Asset src={NoResult}
                message={'No result were found, ${profile?.owner} has not posted yet.'} />
            )}
        </>
    );
    return (
        <Row>
            <Col className="py-2 p-2 p-lg-2" lg={8}>
                <PopularProfiles mobile />
                <Container className={styles.Content}>
                    {hasLoaded ? ( 
                        <> {mainProfile} {mainProfilePosts} </>
                    ): ( 
                        <Asset spinner />
                    )}
                </Container>
            </Col>
            <Col lg={4} className="d-none d-lg-blokc p-0 p-lg-2">
                <PopularProfiles />
            </Col>
        </Row>
    );
}

export default ProfilePage;


